"""Mix, master and package one ad-1 preview: mix2 (with both music cues and
the Resolve clips), loudness to -14 LUFS, a gentle limiter, muxed onto the
export's picture.

  python master.py <tag>     (reads ../ad-1-<tag>-preview, writes ~/Movies/ad-1-resolve/<tag>/ad-1-<tag>.mp4)

Then push to Resolve (backs the project up first):
  ~/Projects/tools/davinci-resolve-mcp/venv/bin/python resolve_push.py ~/Movies/ad-1-resolve/<tag>/manifest.json
"""
import os, sys, json, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
TAG = sys.argv[1]
EXP = os.environ.get('EXPORT_DIR') or os.path.join(HERE, '..', f'ad-1-{TAG}-preview')   # EXPORT_DIR for the 4K master
OUT = os.path.join(HERE, 'out', TAG); os.makedirs(OUT, exist_ok=True)
RES = os.path.expanduser(f'~/Movies/ad-1-resolve/{TAG}')
env = dict(os.environ, MIX_OUT=OUT)
MUSIC = os.environ.get('SCORE')   # "pain.wav,pitch.wav": the composed score; else the v5 cues
if MUSIC and ',' not in MUSIC:   # v13: one full score: split it at the burst (the pitch half then plays from its first sample)
    burst = next(e['at'] for e in json.load(open(os.path.join(EXP, 'markers.json')))['sfx'] if e['id'] == 'burst') / 1000
    a_, b_ = os.path.join(OUT, 'score-pain.wav'), os.path.join(OUT, 'score-pitch.wav')
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', os.path.join(HERE, MUSIC), '-t', f'{burst:.4f}', '-c:a', 'pcm_s24le', a_], check=True)
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-ss', f'{burst:.4f}', '-i', os.path.join(HERE, MUSIC), '-c:a', 'pcm_s24le', b_], check=True)
    MUSIC = f'{a_},{b_}'; env['SCORE_SPLIT'] = '1'
music_args = ['--music-pain', MUSIC.split(',')[0], '--music-pitch', MUSIC.split(',')[1], '--composed'] if MUSIC else ['--music-pain', 'music/v4-pain.mp3', '--music-pitch', 'music/v5-pitch.mp3']
subprocess.run([sys.executable, os.path.join(HERE, 'mix2.py'), EXP, *music_args, '--tag', TAG],
               cwd=HERE, env=env, check=True)
pre = os.path.join(OUT, 'premaster.wav')
r = subprocess.run(['ffmpeg', '-hide_banner', '-i', pre, '-af', 'loudnorm=print_format=summary', '-f', 'null', '-'], capture_output=True, text=True).stderr
lufs = float([l for l in r.splitlines() if 'Input Integrated' in l][0].split()[-2])
gain = -14 - lufs
master = os.path.join(OUT, 'master.wav')
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', pre, '-af', f'volume={gain:.2f}dB,alimiter=limit=0.72:level=disabled', '-c:a', 'pcm_s24le', master], check=True)
video = json.load(open(os.path.join(EXP, 'report.json')))['video']
os.makedirs(RES, exist_ok=True)
mp4 = os.path.join(RES, f'ad-1-{TAG}.mp4')
vcodec = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=codec_name', '-of', 'csv=p=0', video], capture_output=True, text=True).stdout.strip()
vargs = ['-c:v', 'copy'] if vcodec == 'h264' else ['-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p']   # never re-encode an h264 master
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', video, '-i', master, '-map', '0:v', '-map', '1:a', *vargs,
                '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', mp4], check=True)
print(f'premaster {lufs:.1f} LUFS, gain {gain:+.1f} dB ->', mp4)
