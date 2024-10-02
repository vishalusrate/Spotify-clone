// global variable 
let currentSongs = new Audio();
let songs;
let currentFolder;
// minute to seconds javascript code 
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currentFolder = folder;
    let songlist = await fetch(`/${folder}`);
    let response = await songlist.text();
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    
    
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}`)[1]);
        }
    }
    // show all the songs here 
    let songUl = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUl.innerHTML = "";
    // console.log(songs)
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML + `<li>
                            <img class="invert" src="img/music.svg" alt="Music Button">
                            <div class="songinfo">
                                <div>${song.replaceAll("%20")}</div>
                                <div>Vishal</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="img/play.svg" alt="Play button">
                            </div>
                        </li>`
    }
    // we are listening the evenet here 
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playSongs(e.querySelector(".songinfo").firstElementChild.innerHTML.trim());
        })
    });
}
const playSongs = (track, pause = false) => {
    // let audio = new Audio("/songs/"+track)
    currentSongs.src = `${currentFolder}` + track;
    // console.log(currentFolder)
    if (!pause) {
        currentSongs.play();
        // playBtn.src = 'play.svg'
        playBtn.src = 'img/pause.svg'
    }
    
    // console.log(track)
    document.querySelector(".songinfoForPlaybar").innerHTML = track.replace(".mp3", " ").replaceAll("-", " ")
    document.querySelector(".songtime").innerHTML = "00:00/00:00"
}
async function displayTheAlbum(){
    let floder = await fetch(`/songs`);
    let response = await floder.text();
    let div = document.createElement("div")
    div.innerHTML = response
    let anchor = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchor);
    let dataset;
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if(e.href.includes("/songs/")){
            let folderName = e.href.split("/").splice("-2")[0];
            let floder = await fetch(`/songs/${folderName}/info.json`);
            let response = await floder.json();
            if(folderName.includes("20%")){
                dataset = folderName.replaceAll("%20"," ")
            }else{
               dataset = folderName;
            }
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder=${dataset} class="card ">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 100 100">
                                <!-- Green Circle -->
                                <circle cx="50" cy="50" r="48" fill="green" stroke="none"/>
                              
                                <!-- Play Button (Triangle), Centered -->
                                <polygon points="45,35 45,65 65,50" fill="white" />
                              </svg>
                                                     
                        </div>
                        <img src="/songs/${folderName}/cover.jpg" alt="Card Image">
                        <h4>${response.title}</h4>
                        <p>${response.Description}</p>
                    </div>`
        }
    }

    // loading the albumn here 
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click",async item=>{
            // item.dataset.folder
            const folder = item.currentTarget.dataset.folder;
             await getSongs(`songs/${folder}/`);
            playSongs(songs[0])
            // console.log(songs)
        })
    })
}
async function main() {
    // get the list of the all song 
     await getSongs("songs/test/");
    playSongs(songs[0], true)

    // display the all folder here 
    displayTheAlbum();

    // attaching the button behaviour here 
    playBtn.addEventListener("click", element => {
        if (currentSongs.paused) {
            currentSongs.play();
            playBtn.src = 'img/pause.svg'
        } else {
            currentSongs.pause()
            playBtn.src = 'img/play.svg'
        }
    })

    // Get time of the audio
    currentSongs.addEventListener("timeupdate", element => {
        // console.log(currentSongs.duration, currentSongs.currentTime)
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSongs.currentTime)} / ${secondsToMinutesSeconds(currentSongs.duration)}`;

        // seekbar ko dynamic karna hai yaha par
        document.querySelector(".circle").style.left = (currentSongs.currentTime / currentSongs.duration) * 100 + "%"
    })

    // changing the circle according to the click 
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSongs.currentTime = (currentSongs.duration) * percent / 100;
    })
    // adding the event listener for the hamburger icon 
    document.querySelector(".hamburgerContainer").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })

    // close the hamburger here 
    document.querySelector(".close").addEventListener("click",()=>{
        document.querySelector(".left").style.left = "-120%"
    })
    // adding previous functionality here
    previousBtn.addEventListener("click",()=>{
        let index = songs.indexOf(currentSongs.src.split("/").slice(-1)[0]);
        if(index - 1 >= 0){
            playSongs(songs[index - 1])
        }
    })

    
    // adding next functionality here
    nextBtn.addEventListener("click",()=>{
        let index = songs.indexOf(currentSongs.src.split("/").slice(-1)[0]);
        if(index + 1 < songs.length){
            playSongs(songs[index + 1])
        }
    })

    // adding the volume functionality in the audio
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
        currentSongs.volume = parseInt(e.target.value) / 100;
        if(currentSongs.volume > 0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("img/mute.svg","img/volume.svg")
        }
    })
    // add event listener for the volume functionalty 

    document.querySelector(".volume>img").addEventListener("click",e=>{
        // console.log(e.target.src)
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("img/volume.svg","img/mute.svg");
            currentSongs.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
            
        }else{
            e.target.src = e.target.src.replace("img/mute.svg","img/volume.svg");
            currentSongs.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })
    
}


main()