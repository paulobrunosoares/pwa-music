const player = document.querySelector(".player");
const play = document.querySelector(".play");
const pause = document.querySelector(".pause");
const stop = document.querySelector(".stop");
const volUp = document.querySelector(".vol-up");
const volDown = document.querySelector(".vol-down");
const progresBar = document.querySelector(".progresso-atual");
const barraProgresso = document.querySelector(".barra-progresso");
const controlesTime = document.querySelectorAll(".tempo");
const tbody = document.querySelector("tbody");
const animacaoPlay = document.querySelectorAll(".animacao-player");
const controle_show = document.querySelectorAll(".infoMp3 > .show");
const inputAddFiles = document.getElementById("files");
const ctr_scroll = document.querySelector(".ctr-scroll");
const loading = document.querySelector(".loading");

let listaMp3 = [];
const mapLitaMp3 = new Map();
// Processar os arquivos mp3 adicionados na lista
inputAddFiles.addEventListener("change", async (readDados) => {
  // console.log("readDados: ", readDados.target.files);
  const mp3File = Array.from(readDados.target.files);
  listaMp3.push(...mp3File);
  if (listaMp3.length > 0) {
    loading.style.display = "block";
    ctr_scroll.style.display = "none";
  }

  mp3File?.forEach((faixa) => {
    const audioMp3 = new Audio();
    audioMp3.src = URL.createObjectURL(faixa);
    audioMp3.addEventListener("loadedmetadata", async () => {
      const duracao = audioMp3.duration;
      const horas = Math.floor(duracao / 3600);
      const minutos = Math.floor(duracao / 60);
      const segundos = Math.floor(duracao % 60);
      const duracaoTime =
        horas > 0
          ? `${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`
          : `${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`;

      loading.style.display = "none";
      ctr_scroll.style.display = "block";
      await setInfoFileAudioMap(faixa, duracaoTime);
    });
  });
  inputAddFiles.value = "";
});

async function setInfoFileAudioMap(file, duracaoTime) {
  const url = file?.urn || file?.name;
  const showTags = function (url) {
    const tags = ID3.getAllTags(url);
    // console.log(tags);
    const title = tags.title || "";
    const artist = tags.artist || "";
    const album = tags.album || "";
    // const picture = tags.picture || "";
    mapLitaMp3.set(file.name, {
      name: file.name,
      size: file.size,
      duration: duracaoTime,
      title: title,
      artist: artist,
      album: album,
    });
    if (listaMp3.length === mapLitaMp3.size) {
      listarMp3Table();
    }
  };

  ID3.loadTags(
    url,
    () => {
      showTags(url);
    },
    {
      tags: ["title", "artist", "album", "picture", "duration"],
      dataReader: ID3.FileAPIReader(file),
    }
  );
}

let audio = new Audio();
let isPlaying = false;
let timeAudioAtual = 0;
let indexPlayList = 0;
let controleVolume = 0.5;

listarMp3Table = (listaFiles) => {
  // limpar a tabela
  const tbody = document.querySelector("tbody");
  tbody.innerHTML = "";
  // limpar a tabela
  listaMp3.map(async (file, index) => {
    const value = await mapLitaMp3.get(file.name);
    const key = file.name;
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    const tdName = document.createElement("td");
    tdName.style.textAlign = "left";
    const tdDuration = document.createElement("td");

    tbody.appendChild(tr);
    tr.appendChild(td);
    tr.appendChild(tdName);
    tr.appendChild(tdDuration);
    tr.id = index;
    tr.key = key;
    td.innerHTML = index + 1;
    tdName.innerHTML = value?.name || file.name;
    tdDuration.innerHTML = value?.duration || "00:00";

    // aplica hover na linha
    // tr.addEventListener("dblclick", (event) => {
    tr.addEventListener("click", (event) => {
      // console.log("event.currentTarget.id: ", event.currentTarget.key);
      indexPlayList = event.currentTarget.id;
      const key = event.currentTarget.key;
      stop.click();
      activeRowTable(indexPlayList);
      play.click();
      activeAnimation("play");
    });
    tr.addEventListener("mouseover", (e) => {
      // console.log("e in:", e.currentTarget.id, indexPlayList);
      if (e.currentTarget.id != indexPlayList) tr.style.backgroundColor = "#ffffff66";
    });
    tr.addEventListener("mouseout", (e) => {
      // console.log("e-out: ", e.currentTarget.id, indexPlayList);
      if (e.currentTarget.id != indexPlayList) tr.style.backgroundColor = "transparent";
    });
    // aplica hover na linha

    // aplicar estilo na linha ativa
    if (indexPlayList !== 0 || indexPlayList === index) activeRowTable(indexPlayList);
  });
};

activeRowTable = (indexAtivo) => {
  const trs = document.querySelectorAll("tbody > tr");
  trs.forEach((tr) => {
    tr.style.backgroundColor = "transparent";
    tr.style.color = "white";
  });
  trs[indexAtivo].style.background = "#d6ff00e8";
  trs[indexAtivo].style.color = "black";
  activeInfoMp3(listaMp3[indexAtivo].name); // ativa as informações do mp3
};

play.addEventListener("click", () => {
  const fileMp3 = listaMp3[indexPlayList];
  audio.src = URL.createObjectURL(fileMp3);
  if (timeAudioAtual > 0) {
    audio.currentTime = timeAudioAtual;
  }
  if (isPlaying) {
    audio.pause();
    isPlaying = false;
    return;
  }
  audio.play();
  isPlaying = true;
  audio.volume = controleVolume;
  // ativa a animação do botão play
  activeAnimation("play");
  // activeInfoMp3(fileMp3.name, false);

  audio.addEventListener("timeupdate", () => {
    timeAudioAtual = audio.currentTime;
    progresBar.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
    const duracao = audio.duration;
    const currentTime = audio.currentTime;
    const minutosTotal = Math.floor(duracao / 60);
    const segundosTotal = Math.floor(duracao % 60);
    const minutosAtual = Math.floor(currentTime / 60);
    const segundosAtual = Math.floor(currentTime % 60);
    controlesTime[0].innerHTML = `${String(minutosAtual).padStart(2, "0")}:${String(segundosAtual).padStart(2, "0")}`;
    if (!isNaN(minutosTotal) && !isNaN(segundosTotal) && isPlaying) {
      controlesTime[1].innerHTML = `${String(minutosTotal).padStart(2, "0")}:${String(segundosTotal).padStart(2, "0")}`;
    } else controlesTime[1].innerHTML = "00:00";
    audio.addEventListener("ended", () => {
      audio.currentTime = 0;
      stop.click();
      isPlaying = false;
    });
  });
});

pause.addEventListener("click", () => {
  audio.pause();
  isPlaying = false;
  activeAnimation("stop");
});

stop.addEventListener("click", () => {
  audio.pause();
  audio.currentTime = 0;
  isPlaying = false;
  timeAudioAtual = 0;
  audio = new Audio();
  progresBar.style.width = "0%";
  activeAnimation("stop");
});

volUp.addEventListener("click", () => {
  if (audio.volume <= 0.9) {
    audio.volume += 0.1;
    controleVolume = audio.volume;
  }
});

volDown.addEventListener("click", () => {
  if (audio.volume >= 0.1) {
    audio.volume -= 0.1;
    controleVolume = audio.volume;
  }
});

barraProgresso.addEventListener("click", (event) => {
  const widthDynamicBar = barraProgresso.offsetWidth;
  const valuePorcent = audio.duration / widthDynamicBar;
  const clickX = event.offsetX;
  const newTimeProgress = valuePorcent * clickX;
  const duration = isNaN(audio.duration) ? 0 : audio.duration;
  try {
    audio.currentTime = newTimeProgress;
  } catch (error) {
    console.log("clickX: ", clickX);
    console.log("duration: ", duration);
    console.log("error: ", error);
  }
});

function activeAnimation(event = "play" || "stop") {
  animacaoPlay?.forEach((animacao) => {
    if (event === "play") animacao.classList.add("active-animation-player");
    if (event === "stop") animacao.classList.remove("active-animation-player");
  });
}

function activeInfoMp3(key, show = true) {
  const infoMp3 = mapLitaMp3.get(key);
  const showInfo = document.querySelector(".infoMp3");
  showInfo.innerHTML = "";
  const span = document.createElement("span");
  if (!show) {
    span.innerHTML = "Nome da música - Artista - Album";
    showInfo.appendChild(span);
    return;
  }
  const descricao = infoMp3?.title ? infoMp3.title + " - " + infoMp3.artist + " - " + infoMp3.album : infoMp3?.name;
  span.innerHTML = descricao;
  showInfo.appendChild(span);
}

// listarMp3Table();
