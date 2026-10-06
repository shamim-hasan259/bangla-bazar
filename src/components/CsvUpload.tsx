import React, { CSSProperties } from "react";

import { useCSVReader } from "react-papaparse";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

function CsvUpload({ setCSV, handelImport, btnVariant }: any) {
  const { CSVReader } = useCSVReader();

  const handleRemove = () => {
    setCSV([]);
  };

  return (
    <CSVReader
      onUploadAccepted={(results: any) => {
        //  ("---------------------------");
        //  (results);
        let importData = results.data;
        // importData.pop();
        setCSV(importData);
        //  (importData);
        //  ("---------------------------");
      }}
      config={{ header: true }}
    >
      {({ getRootProps, acceptedFile, ProgressBar }: any) => (
        <>
          <div className="flex justify-around items-center">
            <Button
              variant={btnVariant}
              type="button"
              {...getRootProps()}
              className="flex-2"
            >
              Browse file
            </Button>
            {/* <div className="flex-3  border-2 border-black">
              
            </div> */}
            <Input disabled value={acceptedFile?.name || ""} />
            {/* <Button
              onClick={() => handleRemove()}
              // {...getRemoveFileProps()}
              className="flex-2"
            >
              Remove
            </Button> */}
            <div className="py-4">
              <Button onClick={handelImport} variant={btnVariant}>
                Import
              </Button>
            </div>
          </div>
          <ProgressBar style={{ backgroundColor: "black" }} />
        </>
      )}
    </CSVReader>
  );
}

export default CsvUpload;
