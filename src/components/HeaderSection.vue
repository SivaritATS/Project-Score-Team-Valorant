<script setup>
import { 
  currentDateTime, 
  isManualOverride, 
  manualMonth, 
  manualYear, 
  countdownText, 
  activeCycle, 
  MONTH_NAMES_TH 
} from '../store/scoreboard.js';
</script>

<template>
  <header class="main-header">
    <div class="header-logo-group">
      <span class="logo-v">VALORANT</span>
      <span class="logo-subtitle">SCORE TEAM</span>
    </div>

    <div class="scheduler-card">
      <div class="scheduler-row">
        <div class="scheduler-item">
          <span class="lbl">เวลาปัจจุบัน:</span>
          <span class="val font-mono">
            {{ currentDateTime.toLocaleTimeString('th-TH') }} 
            ({{ currentDateTime.getDate() }} {{ MONTH_NAMES_TH[currentDateTime.getMonth()] }} {{ currentDateTime.getFullYear() + 543 }})
          </span>
        </div>
        <div class="scheduler-item highlight-border">
          <span class="lbl font-red">รอบเก็บคะแนน:</span>
          <span class="val font-semibold">{{ MONTH_NAMES_TH[activeCycle.month] }} {{ activeCycle.year + 543 }}</span>
          <span v-if="!isManualOverride" class="badge-auto">อัตโนมัติ</span>
          <span v-else class="badge-manual">แมนนวล</span>
        </div>
      </div>

      <div class="scheduler-countdown" v-if="!isManualOverride">
        <span class="lbl">รีเซ็ตเริ่มรอบใหม่ (ทุกวันที่ 5 ของเดือน):</span>
        <span class="val font-mono timer-glow">{{ countdownText }}</span>
      </div>
      <div class="scheduler-countdown" v-else>
        <span class="lbl text-yellow">คำเตือน: คุณอยู่ในโหมดเลือกเดือนด้วยตนเอง ข้อมูลหน้าต่างนี้จะไม่นับตามเวลาปัจจุบัน</span>
      </div>
    </div>

    <div class="override-control">
      <label class="toggle-container">
        <input type="checkbox" v-model="isManualOverride">
        <span class="checkmark"></span>
        แก้ไขย้อนหลัง / เลือกเดือนเอง
      </label>
      <div class="override-selectors" v-if="isManualOverride">
        <select v-model="manualMonth">
          <option v-for="(mName, idx) in MONTH_NAMES_TH" :key="idx" :value="idx">
            {{ mName }}
          </option>
        </select>
        <select v-model="manualYear">
          <option :value="activeCycle.year - 1">{{ activeCycle.year - 1 + 543 }}</option>
          <option :value="activeCycle.year">{{ activeCycle.year + 543 }}</option>
          <option :value="activeCycle.year + 1">{{ activeCycle.year + 1 + 543 }}</option>
        </select>
      </div>
    </div>
  </header>
</template>
