<script setup>
import { computed, ref, nextTick } from 'vue';
import { 
  state, 
  activeCycle, 
  selectedPlayerId, 
  MONTH_NAMES_EN, 
  MONTH_NAMES_TH, 
  isAddingPlayer, 
  newPlayerName, 
  isEditingPlayer, 
  editingPlayerName, 
  getPlayerMonthlyScore, 
  getPlayerYearlyTotal, 
  getStatusLabel, 
  getLogPoints, 
  openAddLogModal, 
  openEditLogModal, 
  deleteLog, 
  resetCurrentPlayerMonthLogs, 
  startAddPlayer, 
  saveNewPlayer, 
  savePlayerName, 
  deletePlayer 
} from '../store/scoreboard.js';

const playerEditInput = ref(null);

const handleEditClick = async (player) => {
  isEditingPlayer.value = player.id;
  editingPlayerName.value = player.name;
  await nextTick();
  if (playerEditInput.value) {
    playerEditInput.value.focus();
  }
};

const filteredLogs = computed(() => {
  return state.logs
    .filter(log => log.playerId === selectedPlayerId.value &&
      log.month === activeCycle.value.month &&
      log.year === activeCycle.value.year)
    .sort((a, b) => a.day - b.day);
});
</script>

<template>
  <section class="tab-panel">
    <!-- Player Sub-tab selection bar -->
    <div class="player-nav-bar">
      <div class="player-tabs">
        <button 
          v-for="player in state.players" 
          :key="player.id"
          class="player-tab-btn"
          :class="{ active: selectedPlayerId === player.id }"
          @click="selectedPlayerId = player.id"
        >
          <span v-if="isEditingPlayer !== player.id">{{ player.name }}</span>
          <div v-else class="edit-player-inline" @click.stop>
            <input 
              type="text" 
              v-model="editingPlayerName" 
              @keyup.enter="savePlayerName(player.id)" 
              ref="playerEditInput"
            >
            <button class="btn-check" @click="savePlayerName(player.id)">✓</button>
          </div>
          
          <div class="tab-actions-hover" v-if="isEditingPlayer !== player.id">
            <span class="act-edit" title="แก้ไขชื่อ" @click.stop="handleEditClick(player)">✏️</span>
            <span class="act-del" title="ลบผู้เล่น" @click.stop="deletePlayer(player.id)">✕</span>
          </div>
        </button>
        
        <!-- Add Player Button -->
        <button v-if="!isAddingPlayer" class="player-tab-btn add-player-btn" @click="startAddPlayer">
          ➕ เพิ่มผู้เล่น
        </button>
        <div v-else class="add-player-form-inline">
          <input 
            type="text" 
            v-model="newPlayerName" 
            placeholder="ชื่อผู้เล่น..." 
            @keyup.enter="saveNewPlayer" 
            @keyup.esc="isAddingPlayer = false"
          >
          <button class="btn-sm btn-primary" @click="saveNewPlayer">ตกลง</button>
          <button class="btn-sm btn-secondary" @click="isAddingPlayer = false">ยกเลิก</button>
        </div>
      </div>
    </div>

    <div class="player-detail-grid" v-if="state.players.length > 0">
      
      <!-- LEFT SIDE: LOG LEDGER -->
      <div class="detail-ledger-panel">
        <div class="panel-subheader">
          <div>
            <h2>ตารางบันทึกคะแนน — <span class="font-red font-bold">{{ state.players.find(p => p.id === selectedPlayerId)?.name }}</span></h2>
            <p class="subtitle-desc">ตารางเก็บคะแนนประจำรอบเดือน {{ MONTH_NAMES_TH[activeCycle.month] }} {{ activeCycle.year + 543 }}</p>
          </div>
          <div class="subheader-actions" style="display: flex; gap: 10px;">
            <button class="btn btn-danger" @click="resetCurrentPlayerMonthLogs">
              ↺ รีเซ็ตคะแนนเดือนนี้
            </button>
            <button class="btn btn-primary" @click="openAddLogModal">
              ➕ เพิ่มบันทึกรายวัน
            </button>
          </div>
        </div>

        <!-- Ledger Table -->
        <div class="table-responsive-container">
          <table class="grid-table size-sm">
            <thead>
              <tr>
                <th style="width: 50px;">No.</th>
                <th style="width: 70px;">วัน</th>
                <th style="width: 70px;">เดือน</th>
                <th v-for="rule in state.rules" :key="rule.id" class="text-vertical" :title="rule.name">
                  {{ rule.name }} ({{ rule.points }}p)
                </th>
                <th>คะแนน/วัน</th>
                <th>หมายเหตุ</th>
                <th style="width: 100px;">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(log, idx) in filteredLogs" :key="log.id">
                <td class="text-center font-mono text-muted">{{ idx + 1 }}</td>
                <td class="text-center font-bold font-mono">{{ log.day }}</td>
                <td class="text-center font-mono">{{ MONTH_NAMES_EN[log.month] }}</td>
                
                <!-- Display count for each activity -->
                <td v-for="rule in state.rules" :key="rule.id" class="text-center font-mono"
                  :class="{ 'cell-dimmed': !log.activities[rule.id] }">
                  {{ log.activities[rule.id] || '-' }}
                </td>
                
                <td class="font-bold font-mono text-center cell-day-total">
                  {{ getLogPoints(log) }}
                </td>
                <td class="cell-note">{{ log.note || '-' }}</td>
                <td>
                  <div class="action-btn-group">
                    <button class="btn-icon" @click="openEditLogModal(log)" title="แก้ไข">✏️</button>
                    <button class="btn-icon btn-icon-del" @click="deleteLog(log.id)" title="ลบ">🗑️</button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredLogs.length === 0">
                <td :colspan="state.rules.length + 6" class="text-center pad-lg text-muted">
                  ไม่มีบันทึกข้อมูลของเดือนนี้ กดปุ่ม "เพิ่มบันทึกรายวัน" เพื่อกรอกคะแนน
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <p class="ledger-footnote">* หมายเหตุ: ดับเบิ้ลคลิกแถวหรือคลิกปุ่มดินสอเพื่อแก้ไข และไอคอนถังขยะเพื่อลบบันทึกคะแนน</p>
      </div>

      <!-- RIGHT SIDE: MONTHLY SUMMARY BOX -->
      <div class="detail-summary-card">
        <h3>ตารางคะแนนสะสม</h3>
        <div class="card-body">
          <table class="grid-table size-sm">
            <thead>
              <tr>
                <th>เดือน</th>
                <th>คะแนนรวม</th>
                <th>สถานะ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(mName, idx) in MONTH_NAMES_EN" :key="idx"
                :class="{ 'current-month-row': idx === activeCycle.month }">
                <td class="font-bold">{{ mName }}</td>
                <td class="font-mono text-center font-bold">
                  {{ getPlayerMonthlyScore(selectedPlayerId, idx, activeCycle.year) }}
                </td>
                <td>
                  <span class="status-badge size-xs" :class="getStatusLabel(getPlayerMonthlyScore(selectedPlayerId, idx, activeCycle.year))">
                    {{ getStatusLabel(getPlayerMonthlyScore(selectedPlayerId, idx, activeCycle.year)) }}
                  </span>
                </td>
              </tr>
              <tr class="total-row-highlight">
                <td class="font-bold">รวมทั้งหมด</td>
                <td class="font-mono text-center font-bold text-lg font-red">
                  {{ getPlayerYearlyTotal(selectedPlayerId, activeCycle.year) }}
                </td>
                <td>-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
    <div v-else class="text-center pad-lg text-muted">
      กรุณาเพิ่มผู้เล่นในระบบก่อนเพื่อเข้าใช้งานส่วนนี้
    </div>
  </section>
</template>
