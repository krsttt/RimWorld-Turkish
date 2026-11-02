#!/bin/bash
# usage: mix.sh plan.json video.mp4 sfx.wav out.mp4
plan=$1; vid=$2; sfx=$3; out=$4
read dur norm <<< "$(python3 -c "import json;p=json.load(open('$plan'));print(p['dur'],p['norm'])")"
ins=""; fl=""; i=0
while read k st; do ms=$(python3 -c "print(int($st*1000))"); ins="$ins -i $norm/$k.wav"; fl="$fl[$((i+2)):a]aresample=48000,adelay=${ms}|${ms}[a$i];"; i=$((i+1)); done < <(python3 -c "
import json;p=json.load(open('$plan'))
for k,s in zip(p['keys'],p['starts']): print(k,s)")
labels=$(for j in $(seq 0 $((i-1))); do printf "[a$j]"; done)
ffmpeg -nostdin -v error -y -i $vid -i $sfx $ins -filter_complex "${fl}${labels}amix=inputs=$i:normalize=0,highpass=f=70,acompressor=threshold=-20dB:ratio=2:attack=5:release=80,apad,atrim=0:$dur[v];[1:a]aresample=48000,apad,atrim=0:$dur[s];[v][s]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5[out]" -map 0:v -map "[out]" -c:v copy -c:a aac -b:a 192k -ac 2 -ar 48000 -movflags +faststart $out
