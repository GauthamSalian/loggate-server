import os
import re
import time
import hashlib
from pathlib import Path

# Exact Regexes from LogGate Rust Agent (loggate-agent/src/processor.rs)
EMAIL_RE = re.compile(r'[\w\.-]+@[\w\.-]+\.\w+')
SECRET_RE = re.compile(r'(?i)(bearer\s+|token[=:\s]+|password[=:\s]+|api_key[=:\s]+)[a-zA-Z0-9_\-\.]+')
TIMESTAMP_RE = re.compile(r'\d{4}[-/]\d{2}[-/]\d{2}[T\s]\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?|\b[A-Z][a-z]{2}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2}\b')
UUID_RE = re.compile(r'\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b')
IP_RE = re.compile(r'\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?\b')
HEX_RE = re.compile(r'\b0x[0-9a-fA-F]+\b')
ID_RE = re.compile(r'\b([a-zA-Z]+[_-]\d+|\d+)\b')

def mask_log_line(line: str) -> str:
    s = EMAIL_RE.sub('[EMAIL_ADDRESS]', line)
    s = SECRET_RE.sub(r'\1[SECRET]', s)
    s = TIMESTAMP_RE.sub('[TIMESTAMP]', s)
    s = UUID_RE.sub('[UUID]', s)
    s = IP_RE.sub('[IP_ADDRESS]', s)
    s = HEX_RE.sub('[HEX]', s)
    s = ID_RE.sub('[ID]', s)
    return s

def benchmark_dataset(file_path: Path):
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        lines = [line.strip() for line in f if line.strip()]
    
    total_raw_lines = len(lines)
    raw_bytes = sum(len(line.encode('utf-8')) for line in lines)
    
    patterns = {}
    
    # Warmup
    for l in lines[:50]:
        _ = mask_log_line(l)
        
    t0 = time.perf_counter()
    for line in lines:
        masked = mask_log_line(line)
        h = hashlib.sha256(masked.encode('utf-8')).hexdigest()
        if h not in patterns:
            patterns[h] = {
                'count': 0,
                'sample': line,
                'pattern': masked,
                'raw_bytes': 0
            }
        patterns[h]['count'] += 1
        patterns[h]['raw_bytes'] += len(line.encode('utf-8'))
    t1 = time.perf_counter()
    
    elapsed = t1 - t0
    unique_patterns = len(patterns)
    reduction_pct = ((total_raw_lines - unique_patterns) / total_raw_lines) * 100.0 if total_raw_lines else 0
    
    # Payload size when transmitting deduplicated pattern + metadata vs raw
    # Each unique pattern record: pattern string + hash (32B) + count (8B) + sample line
    reduced_payload_bytes = sum(len(p['pattern'].encode('utf-8')) + len(p['sample'].encode('utf-8')) + 64 for p in patterns.values())
    byte_reduction_pct = ((raw_bytes - reduced_payload_bytes) / raw_bytes) * 100.0 if raw_bytes else 0
    throughput = total_raw_lines / elapsed if elapsed > 0 else 0
    
    return {
        'name': file_path.name,
        'raw_lines': total_raw_lines,
        'unique_patterns': unique_patterns,
        'reduction_pct': reduction_pct,
        'raw_bytes_kb': raw_bytes / 1024.0,
        'reduced_bytes_kb': reduced_payload_bytes / 1024.0,
        'byte_reduction_pct': byte_reduction_pct,
        'elapsed_sec': elapsed,
        'throughput_lines_sec': throughput
    }

def main():
    data_dir = Path(__file__).parent / 'benchmark_data'
    files = list(data_dir.glob('*_2k.log'))
    if not files:
        print("No benchmark files found in", data_dir)
        return

    results = []
    print("=" * 130)
    print(f" LOGGATE BENCHMARK RESULTS ACROSS REAL-WORLD LOG DATASETS (LogHub / LogPAI)")
    print("=" * 130)
    print(f"{'Benchmark Dataset':<20} | {'Raw Lines':<10} | {'Unique Patterns':<16} | {'Line Reduction %':<18} | {'Raw (KB)':<10} | {'Reduced (KB)':<12} | {'Byte Reduction %':<18} | {'Throughput (lines/s)':<20}")
    print("-" * 130)
    
    total_raw = 0
    total_unique = 0
    total_raw_b = 0
    total_red_b = 0
    total_elapsed = 0
    
    for f in sorted(files):
        res = benchmark_dataset(f)
        results.append(res)
        total_raw += res['raw_lines']
        total_unique += res['unique_patterns']
        total_raw_b += res['raw_bytes_kb']
        total_red_b += res['reduced_bytes_kb']
        total_elapsed += res['elapsed_sec']
        print(f"{res['name']:<20} | {res['raw_lines']:<10} | {res['unique_patterns']:<16} | {res['reduction_pct']:<17.2f}% | {res['raw_bytes_kb']:<10.2f} | {res['reduced_bytes_kb']:<12.2f} | {res['byte_reduction_pct']:<17.2f}% | {res['throughput_lines_sec']:<20.1f}")
        
    overall_line_reduc = ((total_raw - total_unique) / total_raw) * 100.0
    overall_byte_reduc = ((total_raw_b - total_red_b) / total_raw_b) * 100.0
    overall_throughput = total_raw / total_elapsed if total_elapsed > 0 else 0
    print("-" * 130)
    print(f"{'OVERALL TOTALS':<20} | {total_raw:<10} | {total_unique:<16} | {overall_line_reduc:<17.2f}% | {total_raw_b:<10.2f} | {total_red_b:<12.2f} | {overall_byte_reduc:<17.2f}% | {overall_throughput:<20.1f}")
    print("=" * 130)

if __name__ == '__main__':
    main()
