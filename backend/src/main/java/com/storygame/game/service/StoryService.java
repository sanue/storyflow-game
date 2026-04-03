package com.storygame.game.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.storygame.game.model.Choice;
import com.storygame.game.model.StoryNode;
import com.storygame.game.model.UserState;
import com.storygame.game.repository.StoryNodeRepository;
import com.storygame.game.repository.UserStateRepository;

@Service
public class StoryService {

    public static final String DEFAULT_USER_ID = "demo";
    public static final String START_NODE_ID = "node_01_start";

    private static final Pattern CONDITION_PATTERN = Pattern.compile("^(>=|<=|==|!=|>|<)\\s*(\\d+)$");

    private final StoryNodeRepository storyNodeRepository;
    private final UserStateRepository userStateRepository;

    public StoryService(StoryNodeRepository storyNodeRepository, UserStateRepository userStateRepository) {
        this.storyNodeRepository = storyNodeRepository;
        this.userStateRepository = userStateRepository;
    }

    public StoryNodeResponse start(String userId) {
        String safeUserId = (userId == null || userId.isBlank()) ? DEFAULT_USER_ID : userId;

        UserState state = userStateRepository.findById(safeUserId).orElseGet(() -> {
            UserState s = new UserState();
            s.setUserId(safeUserId);
            s.setStats(new HashMap<>());
            return s;
        });

        if (state.getStats() == null) {
            state.setStats(new HashMap<>());
        }

        state.setCurrentNodeId(START_NODE_ID);
        userStateRepository.save(state);

        return resolveToChoiceOrEnding(state);
    }

    public StoryNodeResponse current(String userId) {
        String safeUserId = (userId == null || userId.isBlank()) ? DEFAULT_USER_ID : userId;

        UserState state = userStateRepository.findById(safeUserId).orElseGet(() -> {
            UserState s = new UserState();
            s.setUserId(safeUserId);
            s.setStats(new HashMap<>());
            s.setCurrentNodeId(START_NODE_ID);
            return userStateRepository.save(s);
        });

        return resolveToChoiceOrEnding(state);
    }

    public StoryNodeResponse choose(String userId, String fromNodeId, String choiceId) {
        String safeUserId = (userId == null || userId.isBlank()) ? DEFAULT_USER_ID : userId;

        UserState state = userStateRepository.findById(safeUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "user state not found"));

        if (fromNodeId == null || choiceId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "fromNodeId/choiceId required");
        }
        if (!fromNodeId.equals(state.getCurrentNodeId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "fromNodeId mismatch");
        }

        StoryNode fromNode = loadNode(fromNodeId);
        Choice picked = fromNode.getChoices().stream()
                .filter(c -> choiceId.equals(c.getId()))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "choice not found"));

        if (!isChoiceAvailable(state, picked)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "choice not available by current stats");
        }

        applyEffect(state, picked);

        state.setCurrentNodeId(picked.getNextNodeId());
        userStateRepository.save(state);

        return resolveToChoiceOrEnding(state);
    }

    private StoryNodeResponse resolveToChoiceOrEnding(UserState state) {
        StoryNode node = loadNode(state.getCurrentNodeId());

        // 自动推进：当节点类型是 text 时，沿 autoNextNodeId 走到 choice/ending。
        while (node != null
                && "text".equals(node.getType())
                && node.getAutoNextNodeId() != null
                && !node.getAutoNextNodeId().isBlank()) {
            state.setCurrentNodeId(node.getAutoNextNodeId());
            node = loadNode(state.getCurrentNodeId());
        }

        if (node == null) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "node not found during resolve");
        }

        // 记录最新节点 id
        state.setCurrentNodeId(node.getId());
        userStateRepository.save(state);

        return toResponse(node, state);
    }

    private StoryNodeResponse toResponse(StoryNode node, UserState state) {
        if ("choice".equals(node.getType())) {
            List<ChoiceView> choices = node.getChoices().stream()
                    .map(c -> new ChoiceView(c.getId(), c.getLabel(), isChoiceAvailable(state, c)))
                    .toList();
            return new StoryNodeResponse(node.getId(), node.getType(), node.getText(), choices);
        }

        return new StoryNodeResponse(node.getId(), node.getType(), node.getText(), List.of());
    }

    private boolean isChoiceAvailable(UserState state, Choice choice) {
        Map<String, Integer> stats = Optional.ofNullable(state.getStats()).orElseGet(HashMap::new);
        Map<String, String> condition = Optional.ofNullable(choice.getCondition()).orElseGet(HashMap::new);

        if (condition.isEmpty()) {
            return true;
        }

        for (Map.Entry<String, String> e : condition.entrySet()) {
            String key = e.getKey();
            String expr = e.getValue();
            if (expr == null || expr.isBlank()) {
                continue;
            }

            int actual = stats.getOrDefault(key, 0);
            if (!compare(actual, expr)) {
                return false;
            }
        }

        return true;
    }

    private boolean compare(int actual, String expr) {
        String trimmed = expr.trim().replace("\"", "");
        Matcher m = CONDITION_PATTERN.matcher(trimmed);
        if (!m.matches()) {
            // 不认识的条件表达式：直接视为不满足（最小实现）
            return false;
        }

        String op = m.group(1);
        int expected = Integer.parseInt(m.group(2));

        return switch (op) {
            case ">=" -> actual >= expected;
            case "<=" -> actual <= expected;
            case "==" -> actual == expected;
            case "!=" -> actual != expected;
            case ">" -> actual > expected;
            case "<" -> actual < expected;
            default -> false;
        };
    }

    private void applyEffect(UserState state, Choice choice) {
        Map<String, Integer> stats = Optional.ofNullable(state.getStats()).orElseGet(() -> {
            Map<String, Integer> s = new HashMap<>();
            state.setStats(s);
            return s;
        });

        if (choice.getEffect() == null || choice.getEffect().isEmpty()) {
            return;
        }

        for (Map.Entry<String, Integer> e : choice.getEffect().entrySet()) {
            String key = e.getKey();
            Integer delta = e.getValue();
            if (delta == null) {
                continue;
            }
            stats.put(key, stats.getOrDefault(key, 0) + delta);
        }
    }

    private StoryNode loadNode(String nodeId) {
        return storyNodeRepository.findById(nodeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "node not found: " + nodeId));
    }

    public record ChoiceView(String id, String label, boolean available) {
    }

    public record StoryNodeResponse(String id, String type, String text, List<ChoiceView> choices) {
    }
}

