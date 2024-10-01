const SLIDES_NAMES = [
    'ferrari',
    'maserati',
    'lamborghini',
    'fiat',
    'peperoni',
    'catherine',
    'spaghetti',
    'panzani',
    'ravioli',
    'bugatti',
    'suisse',
    'buanderie',
    'pipi',
    'pizza',
    'ravezies',
    'yahoo',
]

let slides = []
let counter = -1;
let started = false
let restartCount = 0;
let branchCount = 0;
let announcerOverlayShown = false;
let sounds = []
let currentRunArray = []
let announcerComments = [
    "Le racisme",
    "Limite, limite",
    "Dans la vie, il faut.",
    "Soyez.",
    "Mario a changé",
    "Faut verrouiller son PC, en effet",
    "L'état de tes yeux après ça"
]
let announcerCommentCounter = 0

window.addEventListener('load', loadCallback)

async function playSound(url) {
    let audio = new Audio(url);
    audio.autoplay = true;
    audio.volume = 0.5;
    audio.addEventListener("ended", nextSlide);

    sounds.push(audio);

    await audio.play();

    audio.remove();
}

async function getSlide(name) {
    const resp = await fetch(`/slides/${name}/index.json`)
    if (!resp.ok) return undefined

    return await resp.json();
}

async function loadCallback() {
    // load slides from json
    let names = ""

    for (const name of SLIDES_NAMES) {
        let slide = await getSlide(name)
        if (slide === undefined) continue

        slides.push(slide);
        names += name + ", "
    }

    console.log(`Loaded ${names}`)
}

async function start() {
    if (started) return
    started = true

    document.getElementById("disclaimer-text").remove()
    document.getElementById("italian-music").volume = 0.4;
    document.getElementById("italian-music").play()
    document.getElementById("big-image").classList.remove('clickable')

    await nextSlide()
}

async function applySlide(slide) {
    if (branchCount >= 200) {
        showAnnouncerOverlay()
        return
    }

    if (slide === undefined) {
        console.warn("slide passed in applySlide() is null, ignoring")
        return
    }

    let isSlideShiny = slide.shiny !== undefined && slide.shiny

    document.getElementById("big-text-header").innerText = isSlideShiny ? `✨ ${slide.text} ✨` : slide.text;
    document.getElementById("big-image").src = slide.image;

    await playSound(slide.audio)
}

function incrementCounter() {
    counter++;
    if (counter >= currentRunArray.length) {
        counter = 0;
        restartCount++;

        generateNewRunArray();
    }
}

function stopAllSounds() {
    for (let sound of sounds) {
        sound.src = ""
    }

    sounds = []
}

function showAnnouncerOverlay() {
    if (announcerOverlayShown) return
    announcerOverlayShown = true;
    branchCount = 0;

    stopAllSounds()

    document.getElementById("announcer-comment").innerText = announcerComments[announcerCommentCounter]
    announcerCommentCounter++
    if (announcerCommentCounter >= announcerComments.length)
        announcerCommentCounter = 0;

    document.getElementById("italian-music").pause()
    document.getElementById("announcer-overlay").classList.remove("hidden")

    setTimeout(hideAnnouncerOverlay, 2000 + Math.random() * 3462)

    console.log("Shown announcer overlay")
}

function setMemeVisible(name, visible) {
    if (visible) document.getElementById(name).classList.remove("hidden")
    else if (!document.getElementById(name).classList.contains("hidden"))
        document.getElementById(name).classList.add("hidden")
}

async function hideAnnouncerOverlay() {
    if (!announcerOverlayShown) return
    announcerOverlayShown = false;

    document.getElementById("italian-music").play()
    document.getElementById("announcer-overlay").classList.add("hidden")
    await nextSlide()

    setMemeVisible("flag", Math.random() < 0.4)
    setMemeVisible("pc", branchCount > 0)
    setMemeVisible("clap", Math.random() < 0.3)
    setMemeVisible("cat", Math.random() < 0.16)
    setMemeVisible("android", Math.random() < 0.1)

    console.log("Hid announcer overlay")
}

function generateNewRunArray() {
    let filteredArray = []

    for (let slide of slides) {
        if (slide.chance !== undefined && Math.random() >= slide.chance)
            continue
        if (slide.notBefore !== undefined && restartCount < slide.notBefore)
            continue

        filteredArray.push(slide)
    }

    currentRunArray = filteredArray
}

async function nextSlide() {
    incrementCounter()

    let slide = currentRunArray[counter]
    await applySlide(slide)

    if (Math.random() < 0.25 && restartCount > 5 && branchCount < 200)
    {
        branchCount++

        setTimeout(async () => {
            if (branchCount >= 100) {
                showAnnouncerOverlay()
                return
            }
            await applySlide(currentRunArray[counter + 1])
        }, Math.random() * 3000)
    }
}