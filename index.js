const SLIDES_NAMES = [
    'ferrari',
    'maserati',
    'lamborghini',
    'peperoni',
    'catherine',
    'spaghetti',
    'panzani',
    'bugatti',
    'buanderie',
    'pizza',
    'ravezies',
    'yahoo',
]

let slides = []
let counter = -1;
let started = false
let restartCount = 0;
let branchCount = 0;
let racismOverlayShown = false;
let sounds = []
let currentRunArray = []
let racismComments = [
    "Le racisme",
    "Limite, limite",
    "Dans la vie, il faut.",
    "Soyez.",
    "Evitez de sortir avec votre prof",
    "Mario a changé",
    "Faut verrouiller son PC, en effet"
]
let racismCommentCounter = 0

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

    for (const name of SLIDES_NAMES) {
        let slide = await getSlide(name)
        if (slide === undefined) continue

        slides.push(slide);
        console.log(`loaded slide ${slide.text}`)
    }

    console.log(slides)
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
    let isSlideShiny = slide.shiny !== undefined && slide.shiny

    if (branchCount >= 200) {
        showRacismOverlay()
        return
    }

    if (slide === undefined) {
        console.warn("slide passed in applySlide() is null, ignoring")
        return
    }

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

function showRacismOverlay() {
    if (racismOverlayShown) return
    racismOverlayShown = true;
    branchCount = 0;

    stopAllSounds()

    document.getElementById("racism-comment").innerText = racismComments[racismCommentCounter]
    racismCommentCounter++
    if (racismCommentCounter >= racismComments.length)
        racismCommentCounter = 0;

    document.getElementById("italian-music").pause()
    document.getElementById("racism-overlay").classList.remove("hidden")

    setTimeout(hideRacismOverlay, 2000 + Math.random() * 3462)

    console.log("Shown 'le racisme' overlay")
}

async function hideRacismOverlay() {
    if (!racismOverlayShown) return
    racismOverlayShown = false;

    document.getElementById("italian-music").play()
    document.getElementById("racism-overlay").classList.add("hidden")
    await nextSlide()

    if (Math.random() < 0.4) document.getElementById("flag").classList.remove("hidden")
    else if (!document.getElementById("flag").classList.contains("hidden"))
        document.getElementById("flag").classList.add("hidden")

    if (branchCount > 0) document.getElementById("pc").classList.remove("hidden")
    else if (!document.getElementById("pc").classList.contains("hidden"))
        document.getElementById("pc").classList.add("hidden")

    console.log("Hid 'le racisme' overlay")
}

function generateNewRunArray() {
    let filteredArray = []

    for (let slide of slides) {
        if (slide.chance !== undefined && Math.random() >= slide.chance)
            continue
        if (slide.notAfter !== undefined && slide.notAfter < restartCount)
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
                showRacismOverlay()
                return
            }
            await applySlide(currentRunArray[counter + 1])
        }, Math.random() * 3000)
    }
}