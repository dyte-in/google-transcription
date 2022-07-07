/* eslint-disable no-plusplus */
import { DyteParticipants, DyteSelf } from '@dytesdk/web-core';
import '../utils/logger';
import { combineBuffers, float32ToInt16 } from '../utils/audio';
import { googleTranslate } from './googleAPIs';
import {
    GoogleSpeechRecognitionOptions,
    TranscriptionData,
    TranslatedText,
} from '../types';
import emitter from '../utils/emitter';
import speechToText from './wss';

const BUFFER_SIZE = 4096;
const SAMPLE_RATE = 16000;

class GoogleSpeechRecognition {
    /**
     * @description Optionally define a regional endpoint:
     * https://cloud.google.com/speech-to-text/docs/endpoints
     * If this parameter is not defined, the US endpoint will be used by default.
     * @example 'https://eu-speech.googleapis.com'
     */
    public regionalEndpoint: string;

    public transcriptions: TranscriptionData[];

    public translate: boolean;

    public source: string;

    public target: string;

    #outputBuffer: Uint8Array;

    #tempBuffer: ArrayBuffer;

    #tempBufferView: Uint16Array;

    #audioContext: AudioContext;

    #audio: MediaStreamAudioSourceNode;

    #processor: any;

    #starting: boolean;

    #cancelStart: boolean;

    #self: DyteSelf;

    #participants: DyteParticipants;

    #apiKey: string;

    constructor(options: GoogleSpeechRecognitionOptions) {
        this.#apiKey = options.apiKey;
        this.regionalEndpoint = options.regionalEndpoint ?? 'https://speech.googleapis.com';
        this.#tempBuffer = new ArrayBuffer(BUFFER_SIZE * 2);
        this.#tempBufferView = new Uint16Array(this.#tempBuffer);
        this.#self = options.meeting.self;
        this.#participants = options.meeting.participants;
        this.transcriptions = [];
        this.translate = options.translate ?? false;
        this.source = options.source ?? 'en';
        this.target = options.target ?? 'th';

        this.#participants.on('broadcastedMessage', (data) => {
            if (data.type !== 'newTranscription') return;
            this.transcriptions.push(data.payload);
            emitter().emit('transcription', data.payload);
        });
    }

    async #connectAudioContext() {
        const stream = new MediaStream();
        stream.addTrack(this.#self.audioTrack);

        if (!this.#audioContext) {
            this.#audioContext = new AudioContext({
                sampleRate: SAMPLE_RATE,
            });
        }

        try {
            this.#audio = this.#audioContext.createMediaStreamSource(stream);
        } catch (e) {
            this.#audioContext = new AudioContext();
            this.#audio = this.#audioContext.createMediaStreamSource(stream);
        }

        if (!this.#processor) {
            this.#processor = this.#audioContext.createScriptProcessor(
                BUFFER_SIZE,
                1,
                1,
            );
            this.#processor.onaudioprocess = (e: any) => {
                const input = e.inputBuffer.getChannelData(0);
                for (let i = 0; i < input.length; i++) {
                    this.#tempBufferView[i] = float32ToInt16(input[i]);
                }

                this.#outputBuffer = combineBuffers(this.#outputBuffer, this.#tempBuffer);
            };
        }

        this.#audio.connect(this.#processor);
        this.#processor.connect(this.#audioContext.destination);
    }

    async #translate(text: string, source: string, target: string) {
        const translated: TranslatedText = await googleTranslate(
            text,
            source,
            target,
            this.#apiKey,
        );

        return translated?.data?.translations[0].translatedText ?? null;
    }

    on(eventName: 'transcription', listener: (...args: any[]) => void) {
        return emitter().on(eventName, listener);
    }

    async transcribe() {
        const handleAudioStream = async () => {
            if (this.#self.audioEnabled) {
                speechToText(this.#self.audioTrack);
            }
        };
        this.#self.on('audioUpdate', () => {
            handleAudioStream();
        });
    }
}

export default GoogleSpeechRecognition;
