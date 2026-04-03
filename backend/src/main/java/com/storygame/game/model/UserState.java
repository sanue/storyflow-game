package com.storygame.game.model;

import java.util.HashMap;
import java.util.Map;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * 用户当前剧情进度（可按用户 ID 或会话 ID 存储）。
 */
@Document(collection = "user_states")
public class UserState {

    @Id
    private String userId;
    private String currentNodeId;
    /**
     * 统计值（最小实现）：truth / resolve / memory / trust_ayaan / trust_guyan 等。
     * <p>条件判断与选择效果都从这里取值。</p>
     */
    private Map<String, Integer> stats = new HashMap<>();

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getCurrentNodeId() {
        return currentNodeId;
    }

    public void setCurrentNodeId(String currentNodeId) {
        this.currentNodeId = currentNodeId;
    }

    public Map<String, Integer> getStats() {
        return stats;
    }

    public void setStats(Map<String, Integer> stats) {
        this.stats = stats;
    }
}
