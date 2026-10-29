import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getDatabase, ref, onValue, push, remove, set, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

// Same Firebase project as the photo wall; scores live under score/
const app = initializeApp({
  apiKey: 'AIzaSyAN2PsP2lCqLlZJMYyDwcCVcTTJI_8VF9g',
  authDomain: 'halloween-wall-d6a2f.firebaseapp.com',
  databaseURL: 'https://halloween-wall-d6a2f-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'halloween-wall-d6a2f',
  appId: '1:421466684827:web:a692f5d650b46b1992f53e',
});
const db = getDatabase(app);
const auth = getAuth(app);

// cb gets [{id, t: 'o'|'p', v: 10|5|2, at}] oldest first
export const watch = (cb) => onValue(ref(db, 'score/log'), (s) => {
  const v = s.val() || {};
  cb(Object.entries(v).map(([id, e]) => ({ id, ...e })).sort((a, b) => a.at - b.at));
});
export const addPoints = (t, v) => push(ref(db, 'score/log'), { t, v, at: serverTimestamp() });
export const removeEntry = (id) => remove(ref(db, `score/log/${id}`));
export const resetAll = () => remove(ref(db, 'score/log'));
// big screen page: 'score' | 'cover' | 'mae'
export const watchScreen = (cb) => onValue(ref(db, 'score/screen'), (s) => cb(s.val() || 'score'));
// true while this device has a live connection to the database
export const watchConnected = (cb) => onValue(ref(db, '.info/connected'), (s) => cb(s.val() === true));
export const setScreen = (v) => set(ref(db, 'score/screen'), v === 'score' ? null : v);

export function requireLogin(onReady) {
  const box = document.createElement('form');
  box.className = 'login';
  box.innerHTML = `
    <b>กระดานคะแนน</b>
    <input name="email" type="email" placeholder="อีเมล" autocomplete="username" required>
    <input name="pass" type="password" placeholder="รหัสผ่าน" autocomplete="current-password" required>
    <button>เข้าสู่ระบบ</button>
    <small></small>`;
  box.onsubmit = async (e) => {
    e.preventDefault();
    box.querySelector('small').textContent = '';
    try {
      await signInWithEmailAndPassword(auth, box.email.value.trim(), box.pass.value);
    } catch {
      box.querySelector('small').textContent = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
    }
  };
  let started = false;
  onAuthStateChanged(auth, (user) => {
    if (user) {
      box.remove();
      if (!started) { started = true; onReady(); }
    } else {
      document.body.append(box);
    }
  });
}
