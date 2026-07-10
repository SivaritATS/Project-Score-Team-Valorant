<script setup>
import { state } from '../store/scoreboard.js';
</script>

<template>
  <section class="tab-panel">
    <div class="panel-header">
      <h2>ตั้งค่าเกณฑ์เป้าหมาย & เกณฑ์คะแนนในแต่ละกิจกรรม</h2>
    </div>

    <div class="rules-management-area">
      <!-- Target Threshold Setup Card -->
      <div class="threshold-setup-card">
        <h3>🎯 เกณฑ์คะแนนการผ่านประเมินรายเดือน</h3>
        <div class="form-row">
          <label>คะแนนขั้นต่ำต่อเดือน:</label>
          <input type="number" v-model.number="state.threshold" class="input-inline" min="1">
          <span class="text-muted font-sm">(เมื่อได้แต้ม &gt;= เกณฑ์นี้ สถานะจะแสดงเป็น "ผ่านเกณฑ์")</span>
        </div>
        <div class="threshold-preview" v-if="state.threshold">
          💡 เกณฑ์การผ่านประเมิน: ผู้เล่นต้องเก็บคะแนนขั้นต่ำให้ได้ {{ state.threshold }} คะแนนในแต่ละเดือน
        </div>
      </div>

      <!-- Point Mappings Grid Card -->
      <div class="threshold-setup-card">
        <h3>🎛️ เกณฑ์คะแนนสะสม (รายกิจกรรม)</h3>
        <p class="subtitle-desc" style="margin-bottom: 15px;">
          คุณสามารถปรับเปลี่ยนแต้มคะแนนสะสมที่จะเพิ่มให้กับผู้เล่นในแต่ละแมตช์ได้จากที่นี่ (แต้มคะแนนในตารางและสถิติจะคำนวณใหม่ทันที)
        </p>

        <div class="table-responsive-container">
          <table class="grid-table size-sm">
            <thead>
              <tr>
                <th style="width: 250px;">ชื่อกิจกรรม (โหมด / ผลลัพธ์)</th>
                <th style="width: 100px;">คะแนนที่ได้ต่อครั้ง</th>
                <th>คำอธิบายเพิ่มเติม</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="rule in state.rules" :key="rule.id">
                <td class="font-bold font-red">{{ rule.name }}</td>
                <td>
                  <input type="number" v-model.number="rule.points" class="rule-score-input" min="0">
                </td>
                <td>
                  <input type="text" v-model="rule.note" class="rule-note-input" placeholder="คำอธิบายสั้นๆ...">
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>
