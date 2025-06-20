const adjectives = [
  'Mysterious', 'Curious', 'Bright', 'Swift', 'Silent', 'Bold', 'Gentle', 'Wise',
  'Clever', 'Kind', 'Brave', 'Quick', 'Calm', 'Witty', 'Sharp', 'Keen',
  'Noble', 'Fierce', 'Grace', 'Lunar', 'Solar', 'Cosmic', 'Digital', 'Neon'
];

const nouns = [
  'Phoenix', 'Tiger', 'Dragon', 'Wolf', 'Eagle', 'Lion', 'Falcon', 'Panther',
  'Dolphin', 'Raven', 'Fox', 'Bear', 'Hawk', 'Owl', 'Lynx', 'Jaguar',
  'Shadow', 'Storm', 'Thunder', 'Lightning', 'Aurora', 'Nova', 'Comet', 'Star'
];

export const generateUsername = (): string => {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 999) + 1;
  
  return `${adjective}${noun}${number}`;
};