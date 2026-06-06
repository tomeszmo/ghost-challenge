import QRCodeStyling from 'qr-code-styling';
import { pack } from '../utils/compress';
import type { PackedChallenge } from '../types/challenge';

class QRService {
  /** Returns the full receive URL encoded in the QR. */
  generate(challenge: PackedChallenge, container: HTMLElement): string {
    const url = this.buildUrl(pack(challenge));

    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const cssSize = 264;
    const canvasSize = cssSize * dpr;

    const qr = new QRCodeStyling({
      width: canvasSize,
      height: canvasSize,
      type: 'canvas',
      data: url,
      margin: Math.round(10 * dpr),
      qrOptions: { errorCorrectionLevel: 'M' },
      dotsOptions:          { color: '#22d3ee', type: 'rounded'       },
      backgroundOptions:    { color: '#111118'                         },
      cornersSquareOptions: { color: '#a855f7', type: 'extra-rounded'  },
      cornersDotOptions:    { color: '#22d3ee', type: 'dot'            },
    });

    qr.append(container);

    // Scale canvas back to CSS size so it's crisp on high-DPI screens
    const canvas = container.querySelector('canvas');
    if (canvas) {
      canvas.style.width  = `${cssSize}px`;
      canvas.style.height = `${cssSize}px`;
    }

    return url;
  }

  buildUrl(packed: string): string {
    const base = window.location.origin + window.location.pathname;
    return `${base}#/receive?d=${packed}`;
  }
}

export const qrService = new QRService();
