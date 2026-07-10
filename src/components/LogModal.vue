<script setup>
import { 
  state, 
  logForm, 
  isLogModalOpen, 
  editingLogId, 
  MONTH_NAMES_EN, 
  MONTH_NAMES_TH, 
  adjustActivity, 
  saveLog 
} from '../store/scoreboard.js';
</script>

<template>
  <div class="modal-backdrop" v-if="isLogModalOpen" @click.self="isLogModalOpen = false">
    <div class="modal-container">
      <div class="modal-header">
        <h3>{{ editingLogId ? 'แก้ไขข้อมูลบันทึกคะแนน' : 'เพิ่มบันทึกคะแนนรายวัน' }}</h3>
        <button class="modal-close-btn" @click="isLogModalOpen = false">✕</button>
      </div>

      <div class="modal-body">
        <div class="modal-form-top">
          <div class="form-group-inline">
            <label>ผู้เล่น:</label>
            <span class="lbl-display font-bold font-red">
              {{ state.players.find(p => p.id === logForm.playerId)?.name }}
            </span>
          </div>

          <div class="form-group-inline date-select">
            <label>วันที่:</label>
            <input type="number" v-model.number="logForm.day" min="1" max="31" class="day-input">
            <span class="month-label font-bold">/ {{ MONTH_NAMES_EN[logForm.month] }} / {{ logForm.year + 543 }}</span>
          </div>
        </div>

        <h4 class="form-section-title">กรอกจำนวนครั้งที่ทำได้ในแต่ละประเภท</h4>

        <div class="activities-input-grid">
          <div v-for="rule in state.rules" :key="rule.id" class="activity-input-card">
            <div class="act-name-label" :title="rule.note">{{ rule.name }}</div>
            <div class="act-counter-controls">
              <button class="btn-ctrl-qty" @click="adjustActivity(rule.id, -1)">-</button>
              <input type="number" v-model.number="logForm.activities[rule.id]" class="qty-input" min="0">
              <button class="btn-ctrl-qty" @click="adjustActivity(rule.id, 1)">+</button>
            </div>
          </div>
        </div>

        <div class="form-group textarea-group">
          <label for="modalNote">หมายเหตุ:</label>
          <input 
            type="text" 
            id="modalNote" 
            v-model="logForm.note" 
            placeholder="กรอกข้อมูลเพิ่มเติม (ถ้ามี)..."
            class="modal-text-input"
          >
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="isLogModalOpen = false">ยกเลิก</button>
        <button class="btn btn-primary" @click="saveLog">บันทึกข้อมูล</button>
      </div>
    </div>
  </div>
</template>
