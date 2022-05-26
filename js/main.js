const text = document.getElementById("texte");
const deleteButton = document.getElementById("delete");
const shareButton = document.getElementById("share");
const copyButton = document.getElementById("copy");

let config = {
    savetext: false,
    read_time: 220,
    speech_time: 130,
    save_config: false,
}

const saveText = document.getElementById("save_text");
const readTimeSelect = document.getElementById("read_time_select");
const readTime = document.getElementById("read_time");
const speechTimeSelect = document.getElementById("speech_time_select");
const speechTime = document.getElementById("speech_time");
const saveConfig = document.getElementById("save_config");

window.onload = () => {
    if (localStorage.getItem("text")) {
        text.value = localStorage.getItem("text");
    }
    if (localStorage.getItem("config")) {
        config = JSON.parse(localStorage.getItem("config"));
        saveText.checked = config.savetext;
        if (getSelectValues(readTimeSelect).includes(config.read_time)) {
            readTimeSelect.value = config.read_time;
            readTimeSelect.options[readTimeSelect.selectedIndex].selected = true;
            readTime.value = config.read_time;
        } else {
            readTimeSelect.value = "custom";
            readTimeSelect.options[readTimeSelect.selectedIndex].selected = true;
            readTime.value = config.read_time;
            readTime.disabled = false;
        }
        if (getSelectValues(speechTimeSelect).includes(config.speech_time)) {
            speechTimeSelect.value = config.speech_time;
            speechTimeSelect.options[speechTimeSelect.selectedIndex].selected = true;
            speechTime.value = config.speech_time;
        } else {
            speechTimeSelect.value = "custom";
            speechTimeSelect.options[speechTimeSelect.selectedIndex].selected = true;
            speechTime.value = config.speech_time;
            speechTime.disabled = false;
        }
        if (config.save_config) {
            saveConfig.checked = true;
        }
    }
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("text")) {
        text.value = urlParams.get("text");
    }
    if (text.value) {
        // event the textarea edit
        text.dispatchEvent(new Event("input"));
    }
    let footerYear = document.getElementById("year");
    footerYear.innerHTML = String(new Date().getFullYear());
}

text.addEventListener("input", () => {
    const value = text.value;
    document.getElementById("nb_mots").innerHTML = countWords(value);
    document.getElementById("nb_caracteres").innerHTML = value.length.toString();
    document.getElementById("nb_caracteres_blank").innerHTML = value.replace(/\s+|\n/gi, "").length.toString();
    document.getElementById("nb_phrases").innerHTML = countPhrases(value).toString();
    document.getElementById("nb_para").innerHTML = countParagraphs(value).toString();
    document.getElementById("tps_lecture").innerHTML = countReadTime(value).toString();
    document.getElementById("tps_parole").innerHTML = countSpeechTime(value).toString();

    if (config.savetext) {
        localStorage.setItem("text", value);
    }
});

deleteButton.addEventListener("click", () => {
    if (confirm("Voulez-vous vraiment supprimer le texte ?")) {
        text.value = "";
        text.dispatchEvent(new Event("input"));
    }
});
shareButton.addEventListener("click", () => {
    const url = new URL(window.location.href);
    url.searchParams.set("text", text.value);
    navigator.clipboard.writeText(url.href).then(() => {
        alert("L'url a été copiée dans le presse-papier");
    });
});
copyButton.addEventListener("click", () => {
    text.select();
    navigator.clipboard.writeText(text.value).then(() => {
        alert("Le texte a été copié dans le presse-papier");
    });
});


saveText.addEventListener("click", () => {
    config.savetext = saveText.checked;

    if (config.savetext) {
        localStorage.setItem("config", JSON.stringify(config));
    } else {
        localStorage.removeItem("text");
    }

    if (config.save_config) {
        localStorage.setItem("config", JSON.stringify(config));
    }
});


readTimeSelect.addEventListener("change", () => {
    if (readTimeSelect.value === "custom") {
        readTime.disabled = readTimeSelect.value !== "custom";
        return;
    } else {
        readTime.disabled = readTimeSelect.value !== "custom";
    }
    config.read_time = readTimeSelect.value;
    readTime.value = config.read_time;
    document.getElementById("tps_lecture").innerHTML = countReadTime(text.value).toString();

    if (config.save_config) {
        localStorage.setItem("config", JSON.stringify(config));
    }
});


readTime.addEventListener("input", () => {
    config.read_time = readTime.value;

    if (getSelectValues(readTimeSelect).includes(readTime.value)) {
        readTimeSelect.value = config.read_time;
        readTimeSelect.options[readTimeSelect.selectedIndex].selected = true;
        readTime.disabled = true;
    }
    document.getElementById("tps_lecture").innerHTML = countReadTime(text.value).toString();

    if (config.save_config) {
        localStorage.setItem("config", JSON.stringify(config));
    }
});


speechTimeSelect.addEventListener("change", () => {
    if (speechTimeSelect.value === "custom") {
        speechTime.disabled = speechTimeSelect.value !== "custom";
        return;
    } else {
        speechTime.disabled = speechTimeSelect.value !== "custom";
    }
    config.speech_time = speechTimeSelect.value;
    speechTime.value = config.speech_time;
    document.getElementById("tps_parole").innerHTML = countSpeechTime(text.value).toString();

    if (config.save_config) {
        localStorage.setItem("config", JSON.stringify(config));
    }
});

speechTime.addEventListener("input", () => {
    config.speech_time = speechTime.value;

    if (getSelectValues(speechTimeSelect).includes(speechTime.value)) {
        speechTimeSelect.value = config.speech_time;
        speechTimeSelect.options[speechTimeSelect.selectedIndex].selected = true;
        speechTime.disabled = true;
    }
    document.getElementById("tps_parole").innerHTML = countSpeechTime(text.value).toString();

    if (config.save_config) {
        localStorage.setItem("config", JSON.stringify(config));
    }
});

saveConfig.addEventListener("click", () => {
    config.save_config = saveConfig.checked;
    if (config.save_config) {
        localStorage.setItem("config", JSON.stringify(config));
    } else {
        localStorage.removeItem("config");
    }
});


function countWords(string) {
    const words = string.split(/\s+|\n+/);
    if (words[words.length - 1] === "") {
        words.pop();
    }
    return words.length;
}

function countPhrases(string) {
    const phrases = string.replace(/(\.+|:|!|\?)("*|'*|\)*|}*|]*)(\s|\n|\r|\r\n)/gm, "$1$2|").split("|");
    if (phrases[phrases.length - 1] === "") {
        phrases.pop();
    }
    return phrases.length;
}

function countParagraphs(string) {
    const paragraphs = string.split(/\n\n/);
    if (paragraphs[paragraphs.length - 1] === "") {
        paragraphs.pop();
    }
    return paragraphs.length;
}

function countReadTime(string) {
    const words = countWords(string);
    const minutes = Math.floor(words / config.read_time);
    const seconds = Math.floor((words % config.read_time) / (config.read_time / 60));
    let output = "";
    if (minutes > 0) {
        output += minutes + " min";
    }
    if (seconds > 0) {
        output += (output !== "" ? " " : "") + seconds + " sec";
    }
    if (output === "") {
        output = "0 sec";
    }
    return output;
}

function countSpeechTime(string) {
    const words = countWords(string);
    const minutes = Math.floor(words / config.speech_time);
    const seconds = Math.floor((words % config.speech_time) / (config.speech_time / 60));
    let output = "";
    if (minutes > 0) {
        output += minutes + " min";
    }
    if (seconds > 0) {
        output += (output !== "" ? " " : "") + seconds + " sec";
    }
    if (output === "") {
        output = "0 sec";
    }
    return output;
}

function getSelectValues(select) {
    const result = [];
    const options = select && select.options;
    let opt;

    for (let i = 0, iLen = options.length; i < iLen; i++) {
        opt = options[i];
        result.push(opt.value || opt.text);
    }
    return result;
}


let modalBtns = [...document.querySelectorAll(".ask")];
modalBtns.forEach(function (btn) {
    btn.onclick = function () {
        let modal = btn.getAttribute("data-modal");
        document.getElementById(modal).style.display = "block";
    };
});
let closeBtns = [...document.querySelectorAll(".close")];
closeBtns.forEach(function (btn) {
    btn.onclick = function () {
        let modal = btn.closest(".modal");
        modal.style.display = "none";
    };
});
window.onclick = function (event) {
    if (event.target.className === "modal") {
        event.target.style.display = "none";
    }
};