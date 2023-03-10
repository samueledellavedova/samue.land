const me = document.getElementById("me");
const text = "Samuele Della Vedova";

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function type(i = 0) {
  if (i < text.length) {
    await sleep(rand(69, 100));
    me.innerHTML = me.innerHTML.slice(0, 1) + text.slice(0, ++i) + me.innerHTML.slice(-1);
    await type(i);
  }
}

await type();
