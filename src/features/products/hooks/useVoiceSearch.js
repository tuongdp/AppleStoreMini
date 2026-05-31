import { useState, useCallback, useRef } from "react";

export function useVoiceSearch({ onResult, lang = "vi-VN" } = {}) {
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState(null);
    const recognitionRef = useRef(null);

    const SpeechRecognition = typeof window !== "undefined" ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
    const isSupported = !!SpeechRecognition;

    const startListening = useCallback(() => {
        const SR = typeof window !== "undefined" ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
        if (!SR) {
            setError("Trình duyệt không hỗ trợ nhập liệu bằng giọng nói");
            return;
        }
        const recognition = new SR();
        recognition.lang = lang;
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setIsListening(false);
            onResult?.(transcript);
        };

        recognition.onerror = (event) => {
            setIsListening(false);
            if (event.error === "no-speech") {
                setError("Không nghe thấy giọng nói, thử lại nhé");
            } else if (event.error === "not-allowed") {
                setError("Vui lòng cho phép truy cập micro");
            } else {
                setError("Có lỗi xảy ra, thử lại nhé");
            }
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;
        try {
            recognition.start();
            setIsListening(true);
            setError(null);
        } catch (e) {
            setError("Không thể khởi động micro");
            setIsListening(false);
        }
    }, [lang, onResult]);

    const stopListening = useCallback(() => {
        recognitionRef.current?.stop();
        setIsListening(false);
    }, []);

    return { isListening, startListening, stopListening, isSupported, error };
}
