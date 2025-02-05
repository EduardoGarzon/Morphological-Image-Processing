// CARREGANDO COMPONENTES
const canvas = document.querySelector("#window");
const canvasContext = canvas.getContext('2d');

const imageInput = document.querySelector("#uploadImg");

const seOption = document.getElementsByClassName("input-se");
const seLinha = document.querySelector("#seLinha");
const seCruz = document.querySelector("#seCruz");
const seQuadrado = document.querySelector("#seQuadrado");

const erodeButton = document.querySelector("#erodeButton");
const dilateButton = document.querySelector("#dilateButton");
const openButton = document.querySelector("#openButton");
const closeButton = document.querySelector("#closeButton");

const finalImageSection = document.querySelector(".section-final-image");
const image = document.querySelector("#imageTag");
const grayImage = document.querySelector("#grayImageTag");
const binaryImageTag = document.querySelector("#binaryImageTag");
const operatedImage = document.querySelector("#operatedImageTag");

// VARIÁVEIS
let imageData = null;
let selectedSE = null;

const structuringElement = {
    line: [
        [1, 1, 1, 1, 1]
    ],
    cross: [
        [0, 1, 0],
        [1, 1, 1],
        [0, 1, 0]
    ],
    square: [
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1]
    ]
};

// EVENTOS

// Carregando e preparando a imagem selecionada.
imageInput.addEventListener('change', (e) => {
    seLinha.classList.remove('input-se-selected');
    seCruz.classList.remove('input-se-selected');
    seQuadrado.classList.remove('input-se-selected');

    operatedImage.style.display = 'none';

    const file = e.target.files[0];

    if (file) {
        const imageURL = URL.createObjectURL(file);
        image.setAttribute('src', imageURL);

        image.onload = () => {
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
            canvasContext.drawImage(image, 0, 0, canvas.width, canvas.height);
            imageData = canvasContext.getImageData(0, 0, canvas.width, canvas.height);

            imageData = imgToGrayscale(imageData);
            grayImage.setAttribute('src', canvas.toDataURL());

            imageData = imgToBinary(imageData);
            binaryImageTag.setAttribute('src', canvas.toDataURL());

            finalImageSection.style.display = 'flex';

            imageInput.value = null;
            operatedImage.style.diplay = 'none';
        };
    }
});

// Selecinando os elementos estruturantes.
Array.from(seOption).forEach(option => {
    option.addEventListener('click', () => {
        if (option.id === "seLinha") {
            selectedSE = structuringElement.line;
            seLinha.classList.add('input-se-selected');
            seCruz.classList.remove('input-se-selected');
            seQuadrado.classList.remove('input-se-selected');
        } else if (option.id === "seCruz") {
            selectedSE = structuringElement.cross;
            seCruz.classList.add('input-se-selected');
            seLinha.classList.remove('input-se-selected');
            seQuadrado.classList.remove('input-se-selected');
        } else if (option.id === "seQuadrado") {
            selectedSE = structuringElement.square;
            seQuadrado.classList.add('input-se-selected');
            seLinha.classList.remove('input-se-selected');
            seCruz.classList.remove('input-se-selected');
        } else {
            alert("Erro ao selecionar elemento estruturante!");
        }
    });
});

erodeButton.addEventListener('click', () => {
    if (image.hasAttribute('src')) {
        if (selectedSE) {
            const erodedImage = erodeImage(imageData);
            canvasContext.putImageData(erodedImage, 0, 0);
            operatedImage.setAttribute('src', canvas.toDataURL());
            operatedImage.style.display = 'block';
            imageData = erodedImage;
        } else {
            alert("SELECIONE A FORMA DO ELEMENTO ESTRUTURANTE!");
        }
    } else {
        alert("CARREGUE UMA IMAGEM!");
    }
});

dilateButton.addEventListener('click', () => {
    if (image.hasAttribute('src')) {
        if (selectedSE) {
            const dilatedImage = dilateImage(imageData);
            canvasContext.putImageData(dilatedImage, 0, 0);
            operatedImage.setAttribute('src', canvas.toDataURL());
            operatedImage.style.display = 'block';
            imageData = dilatedImage;
        } else {
            alert("SELECIONE A FORMA DO ELEMENTO ESTRUTURANTE!");
        }
    } else {
        alert("CARREGUE UMA IMAGEM!");
    }

});

openButton.addEventListener('click', () => {
    if (image.hasAttribute('src')) {
        if (selectedSE) {
            const openedImage = openImage(imageData);
            canvasContext.putImageData(openedImage, 0, 0);
            operatedImage.setAttribute('src', canvas.toDataURL());
            operatedImage.style.display = 'block';
            imageData = openedImage;
        } else {
            alert("SELECIONE A FORMA DO ELEMENTO ESTRUTURANTE!");
        }
    } else {
        alert("CARREGUE UMA IMAGEM!");
    }
});

closeButton.addEventListener('click', () => {
    if (image.hasAttribute('src')) {
        if (selectedSE) {
            const closedImage = closeImage(imageData);
            canvasContext.putImageData(closedImage, 0, 0);
            operatedImage.setAttribute('src', canvas.toDataURL());
            operatedImage.style.display = 'block';
            imageData = closedImage;
        } else {
            alert("SELECIONE A FORMA DO ELEMENTO ESTRUTURANTE!");
        }
    } else {
        alert("CARREGUE UMA IMAGEM!");
    }
});

// FUNCOES

// Converte uma imagem colorida para uma imagem em escala de cinza.
function imgToGrayscale(imageData) {
    let data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const red = data[i];
        const green = data[i + 1];
        const blue = data[i + 2];

        const gray = 0.299 * red + 0.587 * green + 0.114 * blue;

        data[i] = gray;      // Red
        data[i + 1] = gray;  // Green
        data[i + 2] = gray;  // Blue
    }

    canvasContext.putImageData(imageData, 0, 0);

    return imageData;
}

// Converte uma imagem colorida para uma imagem binária (preto e branco).
function imgToBinary(imageData, threshold = 128) {
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const gray = data[i];
        // 0: preto (fundo) | 255: branco (objeto)
        const value = gray <= threshold ? 255 : 0;
        data[i] = data[i + 1] = data[i + 2] = value;
    }

    canvasContext.putImageData(imageData, 0, 0);

    return imageData;
}

// Aplica a transformacao morfologica de erosao sobre a imagem binária.
function erodeImage(imageData) {
    const { width, height, data } = imageData;
    const output = new Uint8ClampedArray(data.length);
    output.set(data);

    const seWidth = selectedSE[0].length;
    const seHeight = selectedSE.length;

    // Centro do SE (1, 1).   
    const offsetX = Math.floor(seWidth / 2);
    const offsetY = Math.floor(seHeight / 2);

    // Percorrendo cada pixel da imagem.
    for (let y = offsetY; y < height - offsetY; y++) { // coluna.
        for (let x = offsetX; x < width - offsetX; x++) { // linha.
            let erodePixel = true;

            // Verificar cada pixel do elemento estruturante.
            for (let dy = 0; dy < seHeight; dy++) {
                for (let dx = 0; dx < seWidth; dx++) {
                    // Posicao real do pixel na imagem.
                    const imgX = x + dx - offsetX;
                    const imgY = y + dy - offsetY;
                    const pixelIndex = (imgY * width + imgX) * 4;

                    if (selectedSE[dy][dx] === 1 && data[pixelIndex] === 0) {
                        erodePixel = false;
                        break;
                    }
                }
                if (!erodePixel) break;
            }

            const centerIndex = (y * width + x) * 4;

            // Se todos os pixels da área coberta pelo SE forem 1, 
            // então o pixel central do SE é mantido na imagem resultante.
            output[centerIndex] = output[centerIndex + 1] = output[centerIndex + 2] = erodePixel ? 255 : 0; // RGBA
        }
    }

    return new ImageData(output, width, height);
}

// Aplica a transformacao morfologica de dilatacao sobre a imagem binária.
function dilateImage(imageData) {
    const { width, height, data } = imageData;
    const output = new Uint8ClampedArray(data.length);
    output.set(data);

    const seWidth = selectedSE[0].length;
    const seHeight = selectedSE.length;

    // Centro do SE (1, 1).
    const offsetX = Math.floor(seWidth / 2);
    const offsetY = Math.floor(seHeight / 2);

    // Percorrendo cada pixel da imagem.
    for (let y = offsetY; y < height - offsetY; y++) {
        for (let x = offsetX; x < width - offsetX; x++) {
            let match = false;

            // Verifica cada pixel do elemento estruturante.
            for (let dy = 0; dy < seHeight; dy++) {
                for (let dx = 0; dx < seWidth; dx++) {
                    // Posicao real do pixel na imagem.
                    const imgX = x + dx - offsetX;
                    const imgY = y + dy - offsetY;
                    const pixelIndex = (imgY * width + imgX) * 4;

                    if (selectedSE[dy][dx] && data[pixelIndex] === 255) {
                        match = true;
                        break;
                    }
                }
                if (match) break;
            }

            const centerIndex = (y * width + x) * 4;

            // Se pelo menos 1 pixel da área coberta pelo SE for 1,
            // então o pixel central do SE é mantido na imagem resultante.
            output[centerIndex] = output[centerIndex + 1] = output[centerIndex + 2] = match ? 255 : 0; // RGBA
        }
    }

    return new ImageData(output, width, height);
}

// Aplica a transformacao morfologica de abertura sobre a imagem binária.
function openImage(imageData) {
    const erodedImage = erodeImage(imageData);
    return dilateImage(erodedImage);
}

// Aplica a transformacao morfologica de fechamento sobre a imagem binária.
function closeImage(imageData) {
    const dilatedImage = dilateImage(imageData);
    return erodeImage(dilatedImage);
}