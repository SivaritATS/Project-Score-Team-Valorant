<script setup>
import { onMounted, onUnmounted } from 'vue';
import { 
  activeTab, 
  currentDateTime, 
  updateCountdown, 
  loadState 
} from './store/scoreboard.js';

import HeaderSection from './components/HeaderSection.vue';
import TeamSummary from './components/TeamSummary.vue';
import PlayerLogs from './components/PlayerLogs.vue';
import ScoringRules from './components/ScoringRules.vue';
import SettingsPanel from './components/SettingsPanel.vue';
import LogModal from './components/LogModal.vue';

let timerInterval = null;

onMounted(() => {
  loadState();
  
  // Ticking calendar loop
  timerInterval = setInterval(() => {
    currentDateTime.value = new Date();
    updateCountdown();
  }, 1000);
  
  // Initial run
  updateCountdown();
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});
</script>

<template>
  <div class="app-container">
    <HeaderSection />

    <!-- Navigation Tabs -->
    <nav class="nav-tabs">
      <button 
        class="nav-tab-btn" 
        :class="{ active: activeTab === 'summary' }" 
        @click="activeTab = 'summary'"
      >
        <span class="tab-icon">📊</span> สรุปผลคะแนนรวมทั้งทีม
      </button>
      <button 
        class="nav-tab-btn" 
        :class="{ active: activeTab === 'logs' }" 
        @click="activeTab = 'logs'"
      >
        <span class="tab-icon">📝</span> บันทึกคะแนนผู้เล่น
      </button>
      <button 
        class="nav-tab-btn" 
        :class="{ active: activeTab === 'rules' }" 
        @click="activeTab = 'rules'"
      >
        <span class="tab-icon">🛠️</span> เกณฑ์คะแนน & กิจกรรม
      </button>
      <button 
        class="nav-tab-btn" 
        :class="{ active: activeTab === 'settings' }" 
        @click="activeTab = 'settings'"
      >
        <span class="tab-icon">⚙️</span> สำรองข้อมูล & ตั้งค่า
      </button>
    </nav>

    <!-- Main Views -->
    <main>
      <TeamSummary v-if="activeTab === 'summary'" />
      <PlayerLogs v-if="activeTab === 'logs'" />
      <ScoringRules v-if="activeTab === 'rules'" />
      <SettingsPanel v-if="activeTab === 'settings'" />
    </main>

    <!-- Logging Modal Dialog -->
    <LogModal />
  </div>
</template>
