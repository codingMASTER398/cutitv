const voteElements = [...document.querySelectorAll(`.trackV`)];

function updateVoter() {
  if(!window.currentTrack.nextThreePick) return;
  const nextThree = window.currentTrack.nextThreePick;

  voteElements.forEach((e, i)=>{
    const data = nextThree[i]

    e.querySelector(`p`).innerText = data.title;
    e.querySelector(`div`).style = `background-image: url('https://img.youtube.com/vi/${data.ytID}/sddefault.jpg')`;
    e.classList.remove(`selected`);
  })
}

function setVotes(votes) {
  voteElements.forEach((e, i)=>{
    e.querySelector(`votes`).innerText = votes[i]
  })
}

voteElements.forEach((e, i)=>{
  e.addEventListener(`click`, ()=>{
    voteElements.forEach((ee)=>{
      ee.classList.remove(`selected`)
    })
    window.socket.emit("vote", i)
    e.classList.add(`selected`)
  })
})