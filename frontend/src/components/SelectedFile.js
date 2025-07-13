export default function SelectURL({ onSendURL, setLink, link }) {
  return (
    <div className="h-full flex flex-col items-end justify-between p-7 gap-4">
      <div className="w-full">
        <label
          for="minimal-input"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Вставте ссылку на запись или ee ID
        </label>
        <input
          type="text"
          id="minimal-input"
          onInput={setLink}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 mt-1"
          placeholder="https://app.fireflies.ai/view/-mp3::01JZVTDM34M33F5P0BNGP160QK?channelSource=mine"
        />
      </div>
      {link && (
        <div className="w-full flex items-center justify-between gap-4">
          <button className="w-full bg-transparent hover:bg-indigo-500 text-indigo-500 font-normal hover:text-white py-2 px-4 border border-indigo-500 hover:border-transparent rounded" onClick={onSendURL}>
            Отправить
          </button>
        </div>
      )}
    </div>
  );
}
