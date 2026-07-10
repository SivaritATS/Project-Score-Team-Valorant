<script setup>
import { 
  state, 
  activeCycle, 
  MONTH_NAMES_EN, 
  getPlayerMonthlyScore, 
  getPlayerYearlyTotal, 
  getPlayerLatestStatus 
} from '../store/scoreboard.js';
</script>

<template>
  <section class="tab-panel animate-fade-in">
    <div class="panel-header">
      <h2>สรุปคะแนนผู้เล่นทั้งทีม (รายเดือน) ปี {{ activeCycle.year + 543 }}</h2>
      <span class="badge-threshold">เกณฑ์ผ่านขั้นต่ำ: {{ state.threshold }} คะแนนต่อเดือน</span>
    </div>

    <div class="table-responsive-container">
      <table class="grid-table">
        <thead>
          <tr>
            <th class="sticky-col">ผู้เล่น</th>
            <th v-for="(mName, idx) in MONTH_NAMES_EN" :key="idx" 
                :class="{ 'current-month-col': idx === activeCycle.month }">
              {{ mName }}
            </th>
            <th>รวมปี {{ activeCycle.year + 543 }}</th>
            <th>สถานะ (รอบล่าสุด)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="player in state.players" :key="player.id">
            <td class="sticky-col font-bold player-name-cell">{{ player.name }}</td>
            <td v-for="(mName, idx) in MONTH_NAMES_EN" :key="idx" 
                :class="{ 'current-month-col': idx === activeCycle.month }" 
                class="font-mono text-center">
              {{ getPlayerMonthlyScore(player.id, idx, activeCycle.year) }}
            </td>
            <td class="font-bold font-mono text-center cell-highlight-total">
              {{ getPlayerYearlyTotal(player.id, activeCycle.year) }}
            </td>
            <td>
              <span class="status-badge" :class="getPlayerLatestStatus(player.id, activeCycle.year, activeCycle.month)">
                {{ getPlayerLatestStatus(player.id, activeCycle.year, activeCycle.month) }}
              </span>
            </td>
          </tr>
          <tr v-if="state.players.length === 0">
            <td colspan="15" class="text-center text-muted pad-lg">ไม่มีรายชื่อผู้เล่นในระบบ กรุณาเพิ่มผู้เล่นในหน้าบันทึกคะแนน</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="notes-section">
      <h3>หมายเหตุ:</h3>
      <p>• หากคะแนนรวมของผู้เล่นในเดือนใดไม่ถึง <strong class="font-red font-mono">{{ state.threshold }}</strong> แต้ม ให้พิจารณาเปลี่ยนตัวผู้เล่น</p>
      <p>• กรอกคะแนนได้ที่แท็บ <strong>"บันทึกคะแนนผู้เล่น"</strong> ตัวเลขในหน้านี้จะอัปเดตอัตโนมัติ</p>
    </div>
  </section>
</template>
