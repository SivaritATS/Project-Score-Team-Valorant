<script setup>
import {
  exportData,
  handleImport,
  confirmClearAllData
} from '../store/scoreboard.js';
</script>

<template>
  <section class="tab-panel">
    <div class="panel-header">
      <h2>สำรองข้อมูลระบบ & ล้างระบบใหม่</h2>
    </div>

    <div class="settings-grid">
      <!-- Backup Export Card -->
      <div class="settings-card">
        <h3>💾 ส่งออกข้อมูล (Backup JSON)</h3>
        <p class="card-desc text-muted">บันทึกประวัติแต้มและตั้งค่าทั้งหมดในบราวเซอร์นี้
          เก็บไว้เป็นไฟล์ลงบนเครื่องคอมพิวเตอร์ของคุณ</p>
        <div class="settings-actions">
          <button class="btn btn-primary" @click="exportData">
            📦 ดาวน์โหลดข้อมูลสำรอง (.json)
          </button>
        </div>
      </div>

      <!-- Backup Import Card -->
      <div class="settings-card">
        <h3>📂 นำเข้าข้อมูล (Restore JSON)</h3>
        <p class="card-desc text-muted">เลือกไฟล์สำรองข้อมูล JSON ที่คุณเคยบันทึกไว้
          เพื่อคืนค่าระบบทั้งหมดลงในเครื่องนี้ (ข้อมูลปัจจุบันจะถูกแทนที่)</p>
        <div class="settings-actions">
          <div class="file-upload-wrapper">
            <button class="btn btn-secondary">📂 เลือกไฟล์และนำเข้าข้อมูล</button>
            <input type="file" accept=".json" @change="handleImport">
          </div>
        </div>
      </div>

      <!-- Wipe Card -->
      <div class="settings-card border-red">
        <h3>⚠️ ล้างข้อมูล & ข้อมูลทดสอบ</h3>
        <p class="card-desc text-muted">ตัวเลือกนี้สำหรับใช้รีเซ็ตระบบ
          หรือต้องการล้างคะแนนทั้งหมดออกเพื่อเตรียมเริ่มฤดูกาลใหม่</p>
        <div class="settings-actions">
          <button class="btn btn-danger" @click="confirmClearAllData">
            🔥 ล้างข้อมูลทั้งหมด
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
