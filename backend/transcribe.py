import sys
import whisper

def main():
    if len(sys.argv) < 2:
        print("Ошибка: Не передан путь к аудиофайлу.")
        sys.exit(1)

    audio_path = sys.argv[1]
    model = whisper.load_model("base") 
    result = model.transcribe(audio_path)
    print(result["text"])

if __name__ == "__main__":
    main()
