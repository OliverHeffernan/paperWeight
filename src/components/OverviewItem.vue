<!-- A component to display a particular metric within the overview section -->
<!-- found in WorkoutOverview.vue -->
<script setup lang="ts">
defineProps<{
    label: string;
    value: string | number | null;
    icon: string;
}>();
</script>
<template>
    <div v-if="value !== null" class="overview-stat">
        <div class="stat-content">
            <div class="stat-header">
                <i :class="icon + ' stat-icon'"></i>
                <span class="stat-label">{{ label }}</span>
            </div>
            <div class="stat-value">{{ value }}</div>
        </div>
    </div>
</template>

<style scoped>
.overview-stat {
    background: var(--btnBG);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 20px;
    text-align: center;
    transition: all 0.3s ease;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
	box-sizing: border-box;
}

.overview-stat:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    border-color: var(--accent);
}

.stat-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
    height: 100%;
    justify-content: center;
}

.stat-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    opacity: 0.8;
}

.stat-icon {
    font-size: 1.2rem;
    color: var(--accent);
}

.stat-label {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text);
    background: linear-gradient(135deg, var(--text) 0%, var(--accent) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

@media (max-width: 768px) {
    .overview-stat {
        padding: 16px;
    }
    
    .stat-value {
        font-size: 1.3rem;
    }
    
    .stat-icon {
        font-size: 1.1rem;
    }
    
    .stat-label {
        font-size: 0.85rem;
    }
}

@media (max-width: 480px) {
    .overview-stat {
        padding: 14px;
    }
    
    .stat-value {
        font-size: 1.2rem;
    }
}
</style>
