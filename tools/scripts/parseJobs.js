const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

/**
 * GENERATED VIA CHAT GPT 4o
 * @param {*} dir 
 * @param {*} fileList 
 * @returns 
 */

// Function to read all PDF files from a directory and its subdirectories
const readPdfFilesRecursively = (dir, fileList = []) => {
    return new Promise((resolve, reject) => {
        fs.readdir(dir, { withFileTypes: true }, (err, files) => {
            if (err) {
                return reject(err);
            }
            const pdfFiles = files.map(file => {
                const filePath = path.join(dir, file.name);
                if (file.isDirectory()) {
                    return readPdfFilesRecursively(filePath, fileList);
                } else if (path.extname(file.name).toLowerCase() === '.pdf') {
                    fileList.push(filePath);
                }
            });
            Promise.all(pdfFiles).then(() => resolve(fileList)).catch(reject);
        });
    });
};

// Function to parse a PDF file
const parsePdfFile = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                return reject(err);
            }
            pdfParse(data).then(parsedData => {
                resolve(parsedData.text);
            }).catch(reject);
        });
    });
};

// Reorganize the data accordingly for JSON File return a JS Object
const restructureContent = (rawText) => {
    const sections = rawText.split('\n').map(section => section.trim()).filter(section => section);
    const data = {
        title: '',
        description: []
    };

    let currentSection = 'title';
    for (const section of sections) {
        console.log('Section: ', section);
        if (section.match(/YOUR RESPONSIBILITIES:|YOUR RESPONSIBILITY:|YOUR PROFILE:|WE OFFER:/) && section.split(' ').length < 3) {
            currentSection = section.replace(':', '');
            data[currentSection] = [];
        } else if (currentSection) {
            if (!data.title.length) {
                data.title = section;
                currentSection = 'description';
            } else if (currentSection === 'description') {
                data.description.push(section);
            } else {
                data[currentSection].push(section.replaceAll('● ', '').replace('○ ', '- ').trim());
            }
        }
    }
    return {
        "title": data.title,
        "description": data.description.join(' '),
        "responsibilites": data['YOUR RESPONSIBILITIES'] || data['YOUR RESPONSIBILITY'] ? data['YOUR RESPONSIBILITIES'] ?? data['YOUR RESPONSIBILITY'] : [],
        "profile": data['YOUR PROFILE'] ? data['YOUR PROFILE'] : [],
        "offer": data['WE OFFER'] ? data['WE OFFER'] : []
    };
}

// Function to create directory if it doesn't exist
const ensureDirectoryExists = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

// Main function to read, parse and save PDFs to JSON
const main = async () => {
    const pdfDirectory = '../data/jobs/pdfs';
    const outputDirectory = '../data/jobs/json';
    try {
        const pdfFiles = await readPdfFilesRecursively(pdfDirectory);

        for (const pdfFile of pdfFiles) {
            const parsedText = await parsePdfFile(pdfFile);
            const relativePath = path.relative(pdfDirectory, pdfFile);
            const outputFilePath = path.join(outputDirectory, relativePath);
            const outputDirPath = path.dirname(outputFilePath);
            ensureDirectoryExists(outputDirPath);

            // Save parsed data to JSON file with the same name as the PDF
            const jsonFilePath = outputFilePath.replace(/\.pdf$/i, '.json');
            const jsonData = {
                job: path.basename(pdfFile).replace(' Job Description.pdf', ''),
                description: parsedText.replaceAll('\n', '').replaceAll('●', '').trim(),
                content: restructureContent(parsedText)
            };
            fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2));
            console.log(`Parsed data saved to ${jsonFilePath}`);
        }
    } catch (error) {
        console.error('Error processing PDFs:', error);
    }
};

// Run the main function
main();
