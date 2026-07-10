import { ref, reactive, computed, watch } from 'vue';
import { db } from '../assets/firebase.js'; // นำเข้า Firebase
import { doc, getDoc, setDoc } from 'firebase/firestore'; // นำเข้าคำสั่ง Firestore

// --- Constants & Defaults ---
export const MONTH_NAMES_EN = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
export const MONTH_NAMES_TH = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export const DEFAULT_PLAYERS = [
  { id: 'p1', name: 'Oon' },
  { id: 'p2', name: 'Pure' },
  { id: 'p3', name: 'Art' },
  { id: 'p4', name: 'Timmy' },
  { id: 'p5', name: 'Mek' }
];

export const DEFAULT_RULES = [
  { id: 'unrate_team_mvp', name: 'UNRATE TEAM MVP', points: 1, note: 'คะแนน MVP ทีมในโหมด Unrated' },
  { id: 'unrate_match_mvp', name: 'UNRATE MATCH MVP', points: 2, note: 'คะแนน MVP แมตช์ในโหมด Unrated' },
  { id: 'rank_mvp', name: 'RANK MVP', points: 1, note: 'คะแนน MVP ในโหมด Rank' },
  { id: 'rank_lose', name: 'RANK LOSE', points: 1, note: 'คะแนนเมื่อแพ้ในโหมด Rank' },
  { id: 'rank_draw', name: 'RANK DRAW', points: 2, note: 'คะแนนเมื่อเสมอในโหมด Rank' },
  { id: 'rank_win', name: 'RANK WIN', points: 2, note: 'คะแนนเมื่อชนะในโหมด Rank' },
  { id: 'team_deathmatch_team_mvp', name: 'TDM TEAM MVP', points: 1, note: 'คะแนน MVP ทีมในโหมด Team Deathmatch' },
  { id: 'team_deathmatch_match_mvp', name: 'TDM MATCH MVP', points: 2, note: 'คะแนน MVP แมตช์ในโหมด Team Deathmatch' },
  { id: 'deathmatch_1st_match_mvp', name: 'DM 1ST MATCH MVP', points: 2, note: 'คะแนนอันดับ 1 ในโหมด Deathmatch' },
  { id: 'deathmatch_2nd_3rd', name: 'DM 2ND-3RD', points: 1, note: 'คะแนนอันดับ 2-3 ในโหมด Deathmatch' }
];

// July 2026 demo logs for Oon (p1) to match screenshots exactly
export const getDemoLogs = (year) => [
  {
    id: 'demo_log_1',
    playerId: 'p1',
    day: 10,
    month: 6, // July (0-indexed)
    year: year,
    activities: { rank_mvp: 3, rank_win: 10 },
    note: 'ลงเล่นแรงก์ชนะรัวๆ'
  },
  {
    id: 'demo_log_2',
    playerId: 'p1',
    day: 11,
    month: 6, // July
    year: year,
    activities: { unrate_match_mvp: 20, rank_mvp: 4, rank_lose: 30, rank_win: 4 },
    note: 'เล่น Unrated และ Rank'
  },
  {
    id: 'demo_log_3',
    playerId: 'p1',
    day: 12,
    month: 6, // July
    year: year,
    activities: { rank_draw: 20, rank_win: 20, team_deathmatch_team_mvp: 40 },
    note: 'แต้มบวกเยอะมากวันนี้'
  },
  {
    id: 'demo_log_4',
    playerId: 'p1',
    day: 12,
    month: 7, // August
    year: year,
    activities: {},
    note: 'ตัวอย่างแถวว่างสิงหาคม'
  }
];

// --- Reactive State ---
export const storageKey = 'valorant-scoreboard-state';
export const activeTab = ref('summary');
export const selectedPlayerId = ref('p1');

// Calendar & Auto-cycle states
export const currentDateTime = ref(new Date());
export const isManualOverride = ref(false);
export const manualMonth = ref(new Date().getMonth());
export const manualYear = ref(new Date().getFullYear());
export const countdownText = ref('');

// App Core State 
export const state = reactive({
  players: [],
  rules: [],
  logs: [],
  threshold: 200
});

// Modal Dialog States
export const isLogModalOpen = ref(false);
export const editingLogId = ref(null);
export const logForm = reactive({
  playerId: 'p1',
  day: 1,
  month: 6,
  year: 2026,
  activities: {},
  note: ''
});

// Player management states
export const isAddingPlayer = ref(false);
export const newPlayerName = ref('');
export const isEditingPlayer = ref(null);
export const editingPlayerName = ref('');

// --- Cycle Logic (Reset on 5th of every month) ---
export const getAutoCycle = (date) => {
  const d = date.getDate();
  let m = date.getMonth();
  let y = date.getFullYear();
  if (d < 5) {
    m--;
    if (m < 0) {
      m = 11;
      y--;
    }
  }
  return { month: m, year: y };
};

export const activeCycle = computed(() => {
  if (isManualOverride.value) {
    return { month: manualMonth.value, year: manualYear.value };
  } else {
    return getAutoCycle(currentDateTime.value);
  }
});

export const updateCountdown = () => {
  const now = currentDateTime.value;
  const auto = getAutoCycle(now);

  const nextResetYear = auto.month === 11 ? auto.year + 1 : auto.year;
  const nextResetMonth = auto.month === 11 ? 0 : auto.month + 1;
  const nextResetDate = new Date(nextResetYear, nextResetMonth, 5, 0, 0, 0, 0);

  const diffMs = nextResetDate.getTime() - now.getTime();
  if (diffMs <= 0) {
    countdownText.value = 'กำลังเปลี่ยนรอบคะแนน...';
    return;
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diffMs % (1000 * 60)) / 1000);

  countdownText.value = `${days} วัน ${hours} ชม. ${mins} นาที ${secs} วิ.`;
};

// --- Storage Persistence (เชื่อมต่อกับ Firebase) ---
const DOC_REF = doc(db, 'valorant-scoreboard', 'team-data');

export const loadState = async () => {
  try {
    const docSnap = await getDoc(DOC_REF);
    if (docSnap.exists()) {
      const data = docSnap.data();
      state.players = data.players || [];
      state.logs = data.logs || [];
      state.threshold = data.threshold !== undefined ? data.threshold : 200;

      // Sync rules names with DEFAULT_RULES from code
      const loadedRules = data.rules || [];
      state.rules = loadedRules.map(rule => {
        const defaultRule = DEFAULT_RULES.find(dr => dr.id === rule.id);
        if (defaultRule) {
          rule.name = defaultRule.name;
        }
        return rule;
      });

      if (state.players.length > 0) {
        selectedPlayerId.value = state.players[0].id;
      }
    } else {
      // ถ้าเปิดใช้ครั้งแรก ให้สร้างข้อมูลเริ่มต้นขึ้นไปบน Firebase
      await resetToDefaults();
    }
  } catch (e) {
    console.error('Error loading Firebase state, resetting to defaults.', e);
    // ฟอลแบ็ค (Fallback) ใช้ค่าเริ่มต้นกรณีเน็ตหลุดตอนเปิดหน้าเว็บครั้งแรก
    const curY = new Date().getFullYear();
    state.players = JSON.parse(JSON.stringify(DEFAULT_PLAYERS));
    state.rules = JSON.parse(JSON.stringify(DEFAULT_RULES));
    state.logs = getDemoLogs(curY);
    state.threshold = 200;
  }
};

export const saveState = async () => {
  try {
    // ต้องแปลงข้อมูลกลับด้วย JSON.parse/stringify เพื่อถอด Proxy ของ Vue ออกก่อนส่งขึ้น Firestore
    await setDoc(DOC_REF, {
      players: JSON.parse(JSON.stringify(state.players)),
      rules: JSON.parse(JSON.stringify(state.rules)),
      logs: JSON.parse(JSON.stringify(state.logs)),
      threshold: state.threshold
    });
    console.log("Firebase sync successful");
  } catch (e) {
    console.error("Error saving to Firebase:", e);
  }
};

export const resetToDefaults = async () => {
  const curY = new Date().getFullYear();
  state.players = JSON.parse(JSON.stringify(DEFAULT_PLAYERS));
  state.rules = JSON.parse(JSON.stringify(DEFAULT_RULES));
  state.logs = getDemoLogs(curY);
  state.threshold = 200;

  selectedPlayerId.value = 'p1';
  isManualOverride.value = false;
  manualMonth.value = new Date().getMonth();
  manualYear.value = curY;

  await saveState(); // บังคับเซฟขึ้นคลาวด์
};

export const clearAllDatabaseLogs = async () => {
  const curY = new Date().getFullYear();
  state.players = JSON.parse(JSON.stringify(DEFAULT_PLAYERS));
  state.rules = JSON.parse(JSON.stringify(DEFAULT_RULES));
  state.logs = []; // ล้าง logs ให้ว่าง
  state.threshold = 200;

  selectedPlayerId.value = 'p1';
  isManualOverride.value = false;
  manualMonth.value = new Date().getMonth();
  manualYear.value = curY;

  await saveState(); // บังคับเซฟขึ้นคลาวด์
};

// ระบบบันทึกอัตโนมัติ (หน่วงเวลา 1.5 วิ เมื่อหยุดพิมพ์หรือแก้ไข จะส่งข้อมูลไปที่ Firebase)
let saveTimeout = null;
watch(state, () => {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveState();
  }, 1500);
}, { deep: true });

// --- Score Calculation Utilities ---
export const getRulePointsMap = computed(() => {
  const map = {};
  state.rules.forEach(r => {
    map[r.id] = r.points;
  });
  return map;
});

export const getLogPoints = (log) => {
  let score = 0;
  const pointsMap = getRulePointsMap.value;
  if (!log || !log.activities) return 0;

  Object.keys(log.activities).forEach(ruleId => {
    const count = log.activities[ruleId] || 0;
    const pts = pointsMap[ruleId] || 0;
    score += count * pts;
  });
  return score;
};

export const getPlayerMonthlyScore = (playerId, monthIndex, year) => {
  return state.logs
    .filter(log => log.playerId === playerId && log.month === monthIndex && log.year === year)
    .reduce((sum, log) => sum + getLogPoints(log), 0);
};

export const getPlayerYearlyTotal = (playerId, year) => {
  let total = 0;
  for (let m = 0; m < 12; m++) {
    total += getPlayerMonthlyScore(playerId, m, year);
  }
  return total;
};

export const getStatusLabel = (score) => {
  if (score === 0) return 'ยังไม่มีข้อมูล';
  return score >= state.threshold ? 'ผ่านเกณฑ์' : 'ไม่ผ่านเกณฑ์';
};

export const getPlayerLatestStatus = (playerId, year, activeMonthIndex) => {
  const activeScore = getPlayerMonthlyScore(playerId, activeMonthIndex, year);
  if (activeScore > 0) {
    return getStatusLabel(activeScore);
  }
  for (let m = activeMonthIndex - 1; m >= 0; m--) {
    const s = getPlayerMonthlyScore(playerId, m, year);
    if (s > 0) return getStatusLabel(s);
  }
  for (let m = activeMonthIndex + 1; m < 12; m++) {
    const s = getPlayerMonthlyScore(playerId, m, year);
    if (s > 0) return getStatusLabel(s);
  }
  return 'ยังไม่มีข้อมูล';
};

// --- Interactive Logs Actions ---
export const openAddLogModal = () => {
  editingLogId.value = null;
  logForm.playerId = selectedPlayerId.value;
  const today = new Date();
  const autoC = getAutoCycle(today);
  if (autoC.month === activeCycle.value.month && autoC.year === activeCycle.value.year) {
    logForm.day = today.getDate();
  } else {
    logForm.day = 1;
  }
  logForm.month = activeCycle.value.month;
  logForm.year = activeCycle.value.year;
  logForm.note = '';

  logForm.activities = {};
  state.rules.forEach(r => {
    logForm.activities[r.id] = 0;
  });

  isLogModalOpen.value = true;
};

export const openEditLogModal = (log) => {
  editingLogId.value = log.id;
  logForm.playerId = log.playerId;
  logForm.day = log.day;
  logForm.month = log.month;
  logForm.year = log.year;
  logForm.note = log.note || '';

  logForm.activities = {};
  state.rules.forEach(r => {
    logForm.activities[r.id] = log.activities[r.id] || 0;
  });

  isLogModalOpen.value = true;
};

export const saveLog = () => {
  if (logForm.day < 1 || logForm.day > 31) {
    Swal.fire({
      title: 'ข้อผิดพลาด!',
      text: 'กรุณากรอกวันที่ระหว่าง 1-31',
      icon: 'error',
      confirmButtonColor: '#ff4655',
      background: '#121721',
      color: '#ece8e1'
    });
    return;
  }

  const activities = {};
  state.rules.forEach(r => {
    const val = parseInt(logForm.activities[r.id]);
    activities[r.id] = isNaN(val) || val < 0 ? 0 : val;
  });

  if (editingLogId.value) {
    const index = state.logs.findIndex(l => l.id === editingLogId.value);
    if (index !== -1) {
      state.logs[index] = {
        ...state.logs[index],
        day: parseInt(logForm.day),
        activities,
        note: logForm.note
      };
    }
  } else {
    state.logs.push({
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      playerId: logForm.playerId,
      day: parseInt(logForm.day),
      month: logForm.month,
      year: logForm.year,
      activities,
      note: logForm.note
    });
  }

  isLogModalOpen.value = false;
};

export const deleteLog = (logId) => {
  Swal.fire({
    title: 'ยืนยันการลบ?',
    text: 'คุณต้องการลบบันทึกคะแนนของวันนี้ใช่หรือไม่?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ff4655',
    cancelButtonColor: '#7e8b9a',
    confirmButtonText: 'ใช่, ลบเลย!',
    cancelButtonText: 'ยกเลิก',
    background: '#121721',
    color: '#ece8e1'
  }).then((result) => {
    if (result.isConfirmed) {
      state.logs = state.logs.filter(l => l.id !== logId);
      Swal.fire({
        title: 'ลบสำเร็จ!',
        text: 'บันทึกคะแนนถูกลบแล้ว',
        icon: 'success',
        confirmButtonColor: '#ff4655',
        background: '#121721',
        color: '#ece8e1'
      });
    }
  });
};

export const resetCurrentPlayerMonthLogs = () => {
  const player = state.players.find(p => p.id === selectedPlayerId.value);
  if (!player) return;

  const monthName = MONTH_NAMES_TH[activeCycle.value.month];
  const yearTh = activeCycle.value.year + 543;

  Swal.fire({
    title: 'ยืนยันการรีเซ็ต?',
    text: `คุณต้องการรีเซ็ตคะแนนของ "${player.name}" ในเดือน ${monthName} ${yearTh} หรือไม่? ข้อมูลคะแนนทั้งหมดในเดือนนี้จะถูกลบออก!`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ff4655',
    cancelButtonColor: '#7e8b9a',
    confirmButtonText: 'ใช่, รีเซ็ตเลย!',
    cancelButtonText: 'ยกเลิก',
    background: '#121721',
    color: '#ece8e1'
  }).then((result) => {
    if (result.isConfirmed) {
      state.logs = state.logs.filter(log => !(
        log.playerId === selectedPlayerId.value &&
        log.month === activeCycle.value.month &&
        log.year === activeCycle.value.year
      ));
      Swal.fire({
        title: 'รีเซ็ตสำเร็จ!',
        text: `ล้างคะแนนเดือน ${monthName} ของ ${player.name} เรียบร้อยแล้ว`,
        icon: 'success',
        confirmButtonColor: '#ff4655',
        background: '#121721',
        color: '#ece8e1'
      });
    }
  });
};

// --- Player Management Actions ---
export const startAddPlayer = () => {
  newPlayerName.value = '';
  isAddingPlayer.value = true;
};

export const saveNewPlayer = () => {
  const name = newPlayerName.value.trim();
  if (!name) return;

  const id = 'p_' + Date.now();
  state.players.push({ id, name });
  selectedPlayerId.value = id;
  isAddingPlayer.value = false;
};

export const startEditPlayer = (player) => {
  isEditingPlayer.value = player.id;
  editingPlayerName.value = player.name;
};

export const savePlayerName = (playerId) => {
  const name = editingPlayerName.value.trim();
  if (!name) return;

  const index = state.players.findIndex(p => p.id === playerId);
  if (index !== -1) {
    state.players[index].name = name;
  }
  isEditingPlayer.value = null;
};

export const deletePlayer = (playerId) => {
  const player = state.players.find(p => p.id === playerId);
  if (!player) return;

  Swal.fire({
    title: 'ยืนยันการลบผู้เล่น?',
    text: `คุณต้องการลบผู้เล่น "${player.name}" และลบประวัติคะแนนทั้งหมดของผู้เล่นคนนี้หรือไม่? (ไม่สามารถย้อนกลับได้)`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ff4655',
    cancelButtonColor: '#7e8b9a',
    confirmButtonText: 'ใช่, ลบผู้เล่น!',
    cancelButtonText: 'ยกเลิก',
    background: '#121721',
    color: '#ece8e1'
  }).then((result) => {
    if (result.isConfirmed) {
      state.players = state.players.filter(p => p.id !== playerId);
      state.logs = state.logs.filter(l => l.playerId !== playerId);
      if (selectedPlayerId.value === playerId && state.players.length > 0) {
        selectedPlayerId.value = state.players[0].id;
      }
      Swal.fire({
        title: 'ลบสำเร็จ!',
        text: `ลบผู้เล่น "${player.name}" ออกจากระบบแล้ว`,
        icon: 'success',
        confirmButtonColor: '#ff4655',
        background: '#121721',
        color: '#ece8e1'
      });
    }
  });
};

// --- Backup & Restore Actions ---
export const exportData = () => {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `valorant_scoreboard_backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

export const handleImport = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (data.players && data.rules && data.logs && data.threshold !== undefined) {
        state.players = data.players;
        state.logs = data.logs;
        state.threshold = data.threshold;
        state.rules = data.rules.map(rule => {
          const defaultRule = DEFAULT_RULES.find(dr => dr.id === rule.id);
          if (defaultRule) {
            rule.name = defaultRule.name;
          }
          return rule;
        });

        if (state.players.length > 0) {
          selectedPlayerId.value = state.players[0].id;
        }
        Swal.fire({
          title: 'นำเข้าสำเร็จ!',
          text: 'นำเข้าข้อมูลคะแนนเรียบร้อยแล้ว',
          icon: 'success',
          confirmButtonColor: '#ff4655',
          background: '#121721',
          color: '#ece8e1'
        });
      } else {
        Swal.fire({
          title: 'เกิดข้อผิดพลาด!',
          text: 'โครงสร้างไฟล์ข้อมูลไม่ถูกต้อง กรุณาใช้ไฟล์ที่ส่งออกจากระบบนี้เท่านั้น',
          icon: 'error',
          confirmButtonColor: '#ff4655',
          background: '#121721',
          color: '#ece8e1'
        });
      }
    } catch (err) {
      Swal.fire({
        title: 'เกิดข้อผิดพลาด!',
        text: 'ไม่สามารถอ่านไฟล์ได้: ' + err.message,
        icon: 'error',
        confirmButtonColor: '#ff4655',
        background: '#121721',
        color: '#ece8e1'
      });
    }
  };
  reader.readAsText(file);
};

export const confirmClearAllData = () => {
  Swal.fire({
    title: 'กรุณากรอกรหัสผ่านเพื่อล้างข้อมูล',
    input: 'password',
    inputLabel: 'รหัสผ่านผู้ดูแลระบบ',
    inputPlaceholder: 'กรอกรหัสผ่านเพื่อยืนยัน',
    inputAttributes: {
      autocapitalize: 'off',
      autocorrect: 'off'
    },
    showCancelButton: true,
    confirmButtonText: 'ยืนยัน',
    cancelButtonText: 'ยกเลิก',
    confirmButtonColor: '#ff4655',
    cancelButtonColor: '#7e8b9a',
    background: '#121721',
    color: '#ece8e1'
  }).then((result) => {
    if (result.isConfirmed) {
      if (result.value === 'Loiy') {
        clearAllDatabaseLogs();
        Swal.fire({
          title: 'ล้างข้อมูลสำเร็จ!',
          text: 'ล้างข้อมูลทั้งหมดในระบบและเริ่มต้นฐานข้อมูลใหม่แล้ว (ประวัติคะแนนเป็นค่าว่าง)',
          icon: 'success',
          confirmButtonColor: '#ff4655',
          background: '#121721',
          color: '#ece8e1'
        });
      } else {
        Swal.fire({
          title: 'รหัสผ่านไม่ถูกต้อง!',
          text: 'ไม่สามารถล้างข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
          icon: 'error',
          confirmButtonColor: '#ff4655',
          background: '#121721',
          color: '#ece8e1'
        });
      }
    }
  });
};

export const loadDemoDataWithConfirm = () => {
  Swal.fire({
    title: 'โหลดข้อมูลตัวอย่าง?',
    text: 'การโหลดข้อมูลตัวอย่างจะทับข้อมูลผู้เล่นและประวัติบันทึกคะแนนปัจจุบันทั้งหมด คุณต้องการดำเนินการต่อหรือไม่?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ffb01f',
    cancelButtonColor: '#7e8b9a',
    confirmButtonText: 'ใช่, โหลดเลย!',
    cancelButtonText: 'ยกเลิก',
    background: '#121721',
    color: '#ece8e1'
  }).then((result) => {
    if (result.isConfirmed) {
      resetToDefaults();
      Swal.fire({
        title: 'โหลดสำเร็จ!',
        text: 'โหลดข้อมูลคะแนนตัวอย่าง (Oon - กรกฎาคม) สำเร็จแล้ว',
        icon: 'success',
        confirmButtonColor: '#ff4655',
        background: '#121721',
        color: '#ece8e1'
      });
    }
  });
};

export const adjustActivity = (ruleId, amount) => {
  const currentVal = parseInt(logForm.activities[ruleId]) || 0;
  const newVal = currentVal + amount;
  logForm.activities[ruleId] = newVal < 0 ? 0 : newVal;
};