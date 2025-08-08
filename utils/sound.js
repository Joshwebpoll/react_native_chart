// export const playSound = (fileName) => {
//   const audio = new Audio(`/sounds/${fileName}`);
//   audio.play();
// };
// utils/sound.js
export const playSendSound = () => {
  const audio = new Audio("sounds/sound3.mp3");
  audio.volume = 0.1;
  audio.play().catch((err) => console.warn("Send sound error:", err));
};

export const playReceiveSound = () => {
  const audio = new Audio("sounds/sound3.mp3");
  audio.volume = 0.1;
  audio.play().catch((err) => console.warn("Receive sound error:", err));
};
