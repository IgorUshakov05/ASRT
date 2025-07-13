import { useEffect, useState } from "react";
import { useMutation } from "react-query";
import axios from "axios"; 
import SelectURL from "../components/SelectedFile";
import Loading from "../components/Loading";
import PreviewLink from "../components/PreviewLink";

const sendFileRequest = async (url) => {
  const response = await axios.get(
    `${process.env.REACT_APP_BASE_SERVER_URL}/api/v1/create?url=${url}`,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

export default function Index() {
  const [value, setValue] = useState("");

  const { mutate, isLoading, isError, error, data, isSuccess, reset } =
    useMutation(sendFileRequest, {
      onSuccess: (data) => {
        console.log("Файл успешно загружен:", data);
      },
      onError: (error) => {
        console.error("Ошибка загрузки:", error.message);
      },
    });

  const handleInput = (e) => {
    setValue(e.target.value);
  };

  const handleFileSelect = (file) => {
    setValue(file);
  };

  const handleSend = () => {
    mutate(value);
  };

  const resetState = () => {
    reset();
    setValue("");
  };

  useEffect(() => {
    console.log(process.env.REACT_APP_BASE_SERVER_URL);
  }, []);
  return (
    <div className="absolute bottom-0 right-0 left-0 top-0 m-auto flex justify-center items-center">
      <div className="bg-white w-1/3 border rounded-md border-gray-300 max-w-2xl">
        {isLoading ? (
          <Loading />
        ) : (
          <>
            {!data && (
              <SelectURL
                link={value}
                setLink={handleInput}
                onFileSelect={handleFileSelect}
                onSendURL={handleSend}
              />
            )}

            {isSuccess && (
              <PreviewLink
                url={data.url}
                reset={resetState}
                text={data.title || "Не известное имя файла"}
              />
            )}

            {isError && (
              <div className="pl-8 pb-5 text-red-500">
                Ошибка: {error.response?.data?.message || error.message}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
