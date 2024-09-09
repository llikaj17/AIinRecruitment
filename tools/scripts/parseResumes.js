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

// Reorganize the data accordingly for JSON File return a JS Object
const restructureContent = (rawText) => {
    const sections = rawText.split('\n').map(section => section.trim()).filter(section => section);
    const data = {};

    let currentSection = 'name';
    data['name'] = [];
    for (const section of sections) {
        if (section.match(/Personal Information|Education|Experience|Skills/) && section.split(' ').length < 3) {
            currentSection = section.replace(':', '');
            data[currentSection] = [];
        } else if (currentSection) {
            data[currentSection].push(section);
        }
    }
    return {
        "name": data.name[0]?.replaceAll(' ', '') ?? '',
        "personal": parsePersonalInformation(data['Personal Information'] || []),
        "education": data['Education'] || [],
        "experience": parseExperience(data['Experience'] || []),
        "skills": data['Skills']?.length ? data['Skills'].map(skill => skill.replace('•', '').trim()).filter(skill => skill) : [],
    };
}

// Function to parse Personal Information section
const parsePersonalInformation = (infoArray) => {
    const info = {};
    infoArray.forEach(line => {
        const [key, value] = line.split(':').map(part => part.trim());
        if (key && value) {
            info[key] = value;
        }
    });
    return info;
};

// Function to parse Experience section
// It will only work for current cv structure:
const parseExperience = (experienceArray) => {
    const experiences = [];
    let currentExperience = {};
    experienceArray.forEach(line => {
        const row = line.trim();
        const isInNextLine = row[0] === row[0].toLowerCase();
        if (line.match(/•/) || isInNextLine) {
            if (!currentExperience.details) {
                currentExperience.details = [];
            }
            currentExperience.details.push(row.replace('•', '').trim());
        } else {
            if (Object.keys(currentExperience).length > 4) {
                experiences.push(currentExperience);
                currentExperience = {};
            }
            if (!currentExperience?.details) {
                !currentExperience.position ? currentExperience.position = row : currentExperience.company = row;
            } else {
                if (!currentExperience.period) {
                    currentExperience.period = row;
                } else if (!currentExperience.location) {
                    currentExperience.location = row;
                }
            }
        }
    });
    if (Object.keys(currentExperience).length > 0) {
        experiences.push(currentExperience);
    }
    return experiences;
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

// Function to create directory if it doesn't exist
const ensureDirectoryExists = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

// Main function to read, parse and save PDFs to JSON
const main = async () => {
    const pdfDirectory = '../data/resumes';
    const outputDirectory = '../data/parsed/';
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
                fileName: path.basename(pdfFile),
                raw: parsedText.replaceAll('•', '').replaceAll(':', '').replaceAll('\n', '').trim(),
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
