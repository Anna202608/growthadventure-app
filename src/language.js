export const LANG_EVENT = 'lang-change';

// 获取当前语言
export function getAppLang() {
  return localStorage.getItem('app_language') || 'zh';
}

// 设置语言
export function setAppLang(lang) {
  localStorage.setItem('app_language', lang);
  window.dispatchEvent(new Event(LANG_EVENT));
}

export function speakText(text, lang = 'en') {
  if (!text) {
    console.warn('speakText: 没有文本内容');
    return;
  }

  if (!window.speechSynthesis) {
    console.warn('浏览器不支持语音合成');
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9;
  utterance.pitch = 1.1;

  let voices = window.speechSynthesis.getVoices();

  if (voices.length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      const updatedVoices = window.speechSynthesis.getVoices();
      const matched = updatedVoices.find(v => v.lang.startsWith(lang));
      if (matched) {
        utterance.voice = matched;
      }
      window.speechSynthesis.speak(utterance);
    };
    return;
  }

  const matchedVoice = voices.find(v => v.lang.startsWith(lang));
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  utterance.onerror = (event) => {
    console.error('语音合成错误:', event);
  };

  window.speechSynthesis.speak(utterance);
}

export function preloadVoices() {
  if (window.speechSynthesis) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }
}