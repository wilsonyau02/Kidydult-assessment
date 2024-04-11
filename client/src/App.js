import { useEffect, useState } from "react";
import "./App.css";
import { Upload, Button, message } from "antd";
import axios from 'axios';

function App() {
  const [results, setResults] = useState([]);

  const { Dragger } = Upload;

  const props = {
    beforeUpload: (file) => {
      const isTxt = file.type === 'text/plain';
      if (!isTxt) {
        message.error(`${file.name} is not a txt file`);
      }
      return isTxt || Upload.LIST_IGNORE;
    },
    async onChange(file) {
      let fileList = file.fileList;

      try {
        const results = await Promise.all(fileList.map(async (element) => {
          let fileContent = await getFileContent(element.originFileObj);
          fileContent = fileContent.replace(/(\r\n|\n|\r)/gm, "");
          if (fileContent) {
            const response = await axios.post('/api/process-file', {
              data: fileContent
            });
            return {
              fileName: element.name,
              data: response.data
            };
          }
        }));
        setResults(prevResults => {
          const filteredResults = results.filter(newResult => !prevResults.some(prevResult => prevResult.fileName === newResult.fileName));
          return [...prevResults, ...filteredResults];
        });
      } catch (error) {
        console.error('Error occurred while fetching data:', error);
      }
    },
    onRemove(file) {
      setResults(results.filter(newResult => newResult.fileName != file.name));
    },
    multiple: true
  }

  const getFileContent = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve(reader.result);
      }

      reader.onerror = () => {
        reject(reader.error);
      }

      reader.readAsText(file);
    })
  }

  return (
    <div className="content-div">
      <div className="file-upload-div">
        <p>Upload a log file (.txt)</p>
        <Dragger {...props}>
          <p>(Drag and drop your file here)</p>
        </Dragger>
        <Upload
          {...props}>
          <Button>
            Upload
          </Button>
        </Upload>

      </div>
      <div className="results-div">
        <div className="results-content">
          {results.length > 0 ? (
            <div>
              {results.map((result, resultIndex) => (
                <div key={resultIndex}>
                  <p>Results: ({result.fileName})</p>
                  {Object.entries(result.data).map(([key, value], index, array) => (
                    <span key={key}>
                      {index === 0 || value !== array[index - 1][1] ? (
                        <>
                          {index + 1}. {key} - {value} words <br />
                        </>
                      ) : (
                        <>
                          &nbsp; &nbsp; {key} - {value} words <br />
                        </>
                      )}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div>No Results</div>
          )}

        </div>

      </div>
    </div>
  );
}

export default App;