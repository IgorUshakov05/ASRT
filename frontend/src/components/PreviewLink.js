export default function PreviewLink({ text, reset,url }) {
  return (
    <div className="w-full p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center">
        <div className="bg-green-100 p-3 rounded-lg mr-4">
          <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6zm0 2h7v5h5v11H6V4zm2 8v2h8v-2H8zm0 4v2h5v-2H8z"/>
          </svg>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Доступ к таблице</p>
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 font-medium break-all"
          >
            {text}
          </a>
        </div>
      </div>
        <div className="w-full flex items-center justify-between gap-4 mt-3">
          <button onClick={reset} className="w-full bg-transparent hover:bg-indigo-500 text-indigo-500 font-normal hover:text-white py-2 px-4 border border-indigo-500 hover:border-transparent rounded" >
            Хочу еще!
          </button>
        </div>
    </div>
  );
}