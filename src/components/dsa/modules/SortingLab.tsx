import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ArrayBar, StepLog } from '../types';
import { Play, Pause, RotateCcw, Zap } from 'lucide-react';

interface SortingLabProps {
  activeAlgorithm: string;
  onSelectAlgorithm: (id: string) => void;
  speed: number;
}

type OrderPreset = 'random' | 'nearly_sorted' | 'reversed' | 'few_unique';

export const SortingLab: React.FC<SortingLabProps> = ({
  activeAlgorithm,
  onSelectAlgorithm,
  speed
}) => {
  const [arraySize, setArraySize] = useState<number>(20);
  const [array, setArray] = useState<ArrayBar[]>([]);
  const [activePreset, setActivePreset] = useState<OrderPreset>('random');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [stepLogs, setStepLogs] = useState<StepLog[]>([]);
  const [comparisons, setComparisons] = useState<number>(0);
  const [swaps, setSwaps] = useState<number>(0);

  // Precomputed execution generator steps
  const stepsHistoryRef = useRef<{ array: ArrayBar[]; log: StepLog; comparisons: number; swaps: number }[]>([]);
  const initialArrayRef = useRef<ArrayBar[]>([]);

  // Build simulation steps for a given initial array
  const compileSortingSteps = useCallback((sourceArr: ArrayBar[]) => {
    if (!sourceArr || sourceArr.length === 0) return;
    const history: { array: ArrayBar[]; log: StepLog; comparisons: number; swaps: number }[] = [];
    const arrCopy: ArrayBar[] = sourceArr.map(b => ({ ...b, state: 'default' }));
    let compCount = 0;
    let swapCount = 0;

    const recordStep = (desc: string, highlights: number[], type: StepLog['type'] = 'compare') => {
      history.push({
        array: arrCopy.map((b, idx) => {
          let s = b.state;
          if (highlights.includes(idx)) {
            if (type === 'compare') s = 'comparing';
            else if (type === 'swap') s = 'swapping';
            else if (type === 'partition' || type === 'pivot') s = 'pivot';
            else if (type === 'sorted') s = 'sorted';
          }
          return { ...b, state: s };
        }),
        log: {
          step: history.length + 1,
          description: desc,
          highlightedIndices: highlights,
          type
        },
        comparisons: compCount,
        swaps: swapCount
      });
    };

    const n = arrCopy.length;

    // 1. Bubble Sort
    if (activeAlgorithm === 'bubble_sort') {
      for (let i = 0; i < n - 1; i++) {
        let swapped = false;
        for (let j = 0; j < n - i - 1; j++) {
          compCount++;
          recordStep(`Comparing arr[${j}] (${arrCopy[j].value}) and arr[${j + 1}] (${arrCopy[j + 1].value})`, [j, j + 1], 'compare');
          if (arrCopy[j].value > arrCopy[j + 1].value) {
            swapCount++;
            const temp = arrCopy[j];
            arrCopy[j] = arrCopy[j + 1];
            arrCopy[j + 1] = temp;
            swapped = true;
            recordStep(`Swapping arr[${j}] and arr[${j + 1}]`, [j, j + 1], 'swap');
          }
        }
        arrCopy[n - i - 1].state = 'sorted';
        recordStep(`Element at index ${n - i - 1} is now in final sorted position.`, [n - i - 1], 'sorted');
        if (!swapped) break;
      }
      arrCopy.forEach(b => { b.state = 'sorted'; });
      recordStep('Array is fully sorted!', [], 'sorted');
    }
    // 2. Quick Sort
    else if (activeAlgorithm === 'quick_sort') {
      const partition = (low: number, high: number): number => {
        const pivotVal = arrCopy[high].value;
        recordStep(`Chosen pivot arr[${high}] (${pivotVal})`, [high], 'pivot');
        let i = low - 1;

        for (let j = low; j < high; j++) {
          compCount++;
          recordStep(`Comparing arr[${j}] (${arrCopy[j].value}) with pivot (${pivotVal})`, [j, high], 'compare');
          if (arrCopy[j].value < pivotVal) {
            i++;
            if (i !== j) {
              swapCount++;
              const temp = arrCopy[i];
              arrCopy[i] = arrCopy[j];
              arrCopy[j] = temp;
              recordStep(`Swapped arr[${i}] and arr[${j}]`, [i, j], 'swap');
            }
          }
        }
        swapCount++;
        const temp = arrCopy[i + 1];
        arrCopy[i + 1] = arrCopy[high];
        arrCopy[high] = temp;
        arrCopy[i + 1].state = 'sorted';
        recordStep(`Pivot placed in sorted position at index ${i + 1}`, [i + 1], 'sorted');
        return i + 1;
      };

      const quickSort = (low: number, high: number) => {
        if (low < high) {
          const pi = partition(low, high);
          quickSort(low, pi - 1);
          quickSort(pi + 1, high);
        } else if (low >= 0 && low < arrCopy.length) {
          arrCopy[low].state = 'sorted';
        }
      };

      quickSort(0, arrCopy.length - 1);
      arrCopy.forEach(b => { b.state = 'sorted'; });
      recordStep('Quick Sort complete!', [], 'sorted');
    }
    // 3. Insertion Sort
    else if (activeAlgorithm === 'insertion_sort') {
      arrCopy[0].state = 'sorted';
      for (let i = 1; i < n; i++) {
        const keyItem = arrCopy[i];
        let j = i - 1;
        recordStep(`Inserting key arr[${i}] (${keyItem.value}) into sorted prefix [0..${i - 1}]`, [i], 'pivot');

        while (j >= 0) {
          compCount++;
          recordStep(`Comparing key (${keyItem.value}) with arr[${j}] (${arrCopy[j].value})`, [j, j + 1], 'compare');
          if (arrCopy[j].value > keyItem.value) {
            swapCount++;
            arrCopy[j + 1] = arrCopy[j];
            recordStep(`Shifted arr[${j}] forward to index ${j + 1}`, [j, j + 1], 'swap');
            j--;
          } else break;
        }
        arrCopy[j + 1] = keyItem;
        recordStep(`Key placed into position ${j + 1}`, [j + 1], 'sorted');
      }
      arrCopy.forEach(b => { b.state = 'sorted'; });
      recordStep('Insertion Sort complete!', [], 'sorted');
    }
    // 4. Selection Sort
    else if (activeAlgorithm === 'selection_sort') {
      for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        recordStep(`Finding minimum element in sub-array [${i}..${n - 1}]`, [i], 'pivot');

        for (let j = i + 1; j < n; j++) {
          compCount++;
          recordStep(`Comparing arr[${j}] (${arrCopy[j].value}) with current minimum arr[${minIdx}] (${arrCopy[minIdx].value})`, [j, minIdx], 'compare');
          if (arrCopy[j].value < arrCopy[minIdx].value) {
            minIdx = j;
            recordStep(`New minimum found at index ${minIdx} (${arrCopy[minIdx].value})`, [minIdx], 'pivot');
          }
        }

        if (minIdx !== i) {
          swapCount++;
          const temp = arrCopy[i];
          arrCopy[i] = arrCopy[minIdx];
          arrCopy[minIdx] = temp;
          recordStep(`Swapped minimum arr[${minIdx}] with arr[${i}]`, [i, minIdx], 'swap');
        }
        arrCopy[i].state = 'sorted';
        recordStep(`Index ${i} placed in final sorted position.`, [i], 'sorted');
      }
      arrCopy.forEach(b => { b.state = 'sorted'; });
      recordStep('Selection Sort complete!', [], 'sorted');
    }
    // 5. Shell Sort
    else if (activeAlgorithm === 'shell_sort') {
      let gap = Math.floor(n / 2);
      while (gap > 0) {
        recordStep(`Beginning Shell Sort pass with Gap h = ${gap}`, [], 'compare');
        for (let i = gap; i < n; i++) {
          const temp = arrCopy[i];
          let j = i;
          while (j >= gap) {
            compCount++;
            recordStep(`Comparing arr[${j - gap}] (${arrCopy[j - gap].value}) and arr[${j}] (${temp.value}) across gap ${gap}`, [j - gap, j], 'compare');
            if (arrCopy[j - gap].value > temp.value) {
              swapCount++;
              arrCopy[j] = arrCopy[j - gap];
              recordStep(`Shifted arr[${j - gap}] forward to arr[${j}]`, [j - gap, j], 'swap');
              j -= gap;
            } else break;
          }
          arrCopy[j] = temp;
        }
        gap = Math.floor(gap / 2);
      }
      arrCopy.forEach(b => { b.state = 'sorted'; });
      recordStep('Shell Sort complete with final gap h = 1!', [], 'sorted');
    }
    // 6. Merge Sort
    else if (activeAlgorithm === 'merge_sort') {
      const merge = (l: number, m: number, r: number) => {
        const leftArr = arrCopy.slice(l, m + 1);
        const rightArr = arrCopy.slice(m + 1, r + 1);
        let i = 0, j = 0, k = l;

        recordStep(`Merging subarray [${l}..${m}] and [${m + 1}..${r}]`, [l, r], 'pivot');

        while (i < leftArr.length && j < rightArr.length) {
          compCount++;
          if (leftArr[i].value <= rightArr[j].value) {
            arrCopy[k] = leftArr[i];
            i++;
          } else {
            arrCopy[k] = rightArr[j];
            j++;
          }
          swapCount++;
          recordStep(`Placed ${arrCopy[k].value} into merged subarray position ${k}`, [k], 'swap');
          k++;
        }

        while (i < leftArr.length) {
          arrCopy[k] = leftArr[i];
          i++;
          k++;
        }
        while (j < rightArr.length) {
          arrCopy[k] = rightArr[j];
          j++;
          k++;
        }
      };

      const mergeSortHelper = (l: number, r: number) => {
        if (l < r) {
          const m = Math.floor(l + (r - l) / 2);
          mergeSortHelper(l, m);
          mergeSortHelper(m + 1, r);
          merge(l, m, r);
        }
      };

      mergeSortHelper(0, n - 1);
      arrCopy.forEach(b => { b.state = 'sorted'; });
      recordStep('Merge Sort complete!', [], 'sorted');
    }
    // 7. Heap Sort
    else if (activeAlgorithm === 'heap_sort') {
      const heapify = (size: number, rootIdx: number) => {
        let largest = rootIdx;
        const left = 2 * rootIdx + 1;
        const right = 2 * rootIdx + 2;

        if (left < size) {
          compCount++;
          if (arrCopy[left].value > arrCopy[largest].value) largest = left;
        }
        if (right < size) {
          compCount++;
          if (arrCopy[right].value > arrCopy[largest].value) largest = right;
        }

        if (largest !== rootIdx) {
          swapCount++;
          const temp = arrCopy[rootIdx];
          arrCopy[rootIdx] = arrCopy[largest];
          arrCopy[largest] = temp;
          recordStep(`Max-Heapify: Swapped parent arr[${rootIdx}] with child arr[${largest}]`, [rootIdx, largest], 'swap');
          heapify(size, largest);
        }
      };

      // Build Max-Heap
      for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        heapify(n, i);
      }
      recordStep('Max-Heap built successfully!', [0], 'pivot');

      // Extract elements
      for (let i = n - 1; i > 0; i--) {
        swapCount++;
        const temp = arrCopy[0];
        arrCopy[0] = arrCopy[i];
        arrCopy[i] = temp;
        arrCopy[i].state = 'sorted';
        recordStep(`Extracted Max (${temp.value}) to sorted position ${i}`, [i], 'sorted');
        heapify(i, 0);
      }
      arrCopy[0].state = 'sorted';
      recordStep('Heap Sort complete!', [], 'sorted');
    }
    // 8. Counting Sort
    else if (activeAlgorithm === 'counting_sort') {
      const maxVal = Math.max(...arrCopy.map(b => b.value));
      const count = Array(maxVal + 1).fill(0);
      arrCopy.forEach(b => count[b.value]++);

      recordStep(`Computed frequency count array for values up to ${maxVal}`, [], 'pivot');

      let idx = 0;
      for (let i = 0; i <= maxVal; i++) {
        while (count[i] > 0) {
          arrCopy[idx] = { value: i, id: `bar-cs-${idx}-${Date.now()}`, state: 'sorted' };
          recordStep(`Placed count bucket value ${i} at index ${idx}`, [idx], 'swap');
          idx++;
          count[i]--;
        }
      }
      recordStep('Counting Sort complete in O(n + k) time!', [], 'sorted');
    }
    // 9. Radix Sort (LSD)
    else if (activeAlgorithm === 'radix_sort') {
      const maxVal = Math.max(...arrCopy.map(b => b.value));
      for (let exp = 1; Math.floor(maxVal / exp) > 0; exp *= 10) {
        recordStep(`Radix Sort: Sorting by digit at place ${exp} (1s, 10s, ...)`, [], 'pivot');
        const output = Array(n).fill(null);
        const count = Array(10).fill(0);

        for (let i = 0; i < n; i++) {
          const digit = Math.floor(arrCopy[i].value / exp) % 10;
          count[digit]++;
        }
        for (let i = 1; i < 10; i++) {
          count[i] += count[i - 1];
        }
        for (let i = n - 1; i >= 0; i--) {
          const digit = Math.floor(arrCopy[i].value / exp) % 10;
          output[count[digit] - 1] = arrCopy[i];
          count[digit]--;
        }
        for (let i = 0; i < n; i++) {
          arrCopy[i] = output[i];
        }
        recordStep(`Completed distribution pass for place ${exp}`, [], 'compare');
      }
      arrCopy.forEach(b => { b.state = 'sorted'; });
      recordStep('Radix Sort (LSD) complete!', [], 'sorted');
    }

    stepsHistoryRef.current = history;
    setStepLogs(history.map(h => h.log));
    setCurrentStep(0);
    setComparisons(0);
    setSwaps(0);
  }, [activeAlgorithm]);

  // Toptal-style Initial Order Generator
  const generatePresetArray = useCallback((preset: OrderPreset, size: number) => {
    setActivePreset(preset);
    let values: number[] = [];

    if (preset === 'random') {
      for (let i = 0; i < size; i++) {
        values.push(Math.floor(Math.random() * 85) + 10);
      }
    } else if (preset === 'nearly_sorted') {
      for (let i = 0; i < size; i++) {
        values.push(10 + Math.floor((i / size) * 80));
      }
      for (let k = 0; k < Math.max(1, Math.floor(size * 0.15)); k++) {
        const i1 = Math.floor(Math.random() * size);
        const i2 = Math.floor(Math.random() * size);
        const tmp = values[i1];
        values[i1] = values[i2];
        values[i2] = tmp;
      }
    } else if (preset === 'reversed') {
      for (let i = 0; i < size; i++) {
        values.push(95 - Math.floor((i / size) * 80));
      }
    } else if (preset === 'few_unique') {
      const distinct = [20, 45, 70, 90];
      for (let i = 0; i < size; i++) {
        values.push(distinct[i % distinct.length]);
      }
      for (let i = values.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = values[i];
        values[i] = values[j];
        values[j] = temp;
      }
    }

    const newArr: ArrayBar[] = values.map((val, idx) => ({
      value: val,
      id: `bar-${idx}-${Date.now()}`,
      state: 'default'
    }));

    initialArrayRef.current = newArr;
    setArray(newArr);
    setCurrentStep(0);
    setComparisons(0);
    setSwaps(0);
    setIsPlaying(false);
    compileSortingSteps(newArr);
  }, [compileSortingSteps]);

  useEffect(() => {
    generatePresetArray('random', arraySize);
  }, [arraySize, generatePresetArray]);

  useEffect(() => {
    if (initialArrayRef.current.length > 0) {
      setArray(initialArrayRef.current);
      compileSortingSteps(initialArrayRef.current);
    }
  }, [activeAlgorithm, compileSortingSteps]);

  // Animation player loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && stepsHistoryRef.current.length > 0) {
      interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= stepsHistoryRef.current.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          const next = prev + 1;
          const snap = stepsHistoryRef.current[next];
          if (snap) {
            setArray(snap.array);
            setComparisons(snap.comparisons);
            setSwaps(snap.swaps);
          }
          return next;
        });
      }, Math.max(30, 700 / speed));
    }
    return () => clearInterval(interval);
  }, [isPlaying, speed]);

  const handleStepForward = () => {
    if (currentStep < stepsHistoryRef.current.length - 1) {
      const next = currentStep + 1;
      const snap = stepsHistoryRef.current[next];
      if (snap) {
        setArray(snap.array);
        setComparisons(snap.comparisons);
        setSwaps(snap.swaps);
      }
      setCurrentStep(next);
    }
  };

  const handleStepBackward = () => {
    if (currentStep > 0) {
      const prev = currentStep - 1;
      const snap = stepsHistoryRef.current[prev];
      if (snap) {
        setArray(snap.array);
        setComparisons(snap.comparisons);
        setSwaps(snap.swaps);
      }
      setCurrentStep(prev);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setComparisons(0);
    setSwaps(0);
    if (stepsHistoryRef.current.length > 0) {
      setArray(stepsHistoryRef.current[0].array);
    }
  };

  const currentLog = stepLogs[currentStep] || {
    step: 0,
    description: 'Array initialized. Press Auto Play or Step Forward to start sorting.',
    type: 'compare'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
      {/* 9 Sorting Algorithms Multi-Row Selector & Toptal Presets */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Algorithms */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'bubble_sort', name: 'Bubble Sort' },
            { id: 'selection_sort', name: 'Selection Sort' },
            { id: 'insertion_sort', name: 'Insertion Sort' },
            { id: 'shell_sort', name: 'Shell Sort' },
            { id: 'merge_sort', name: 'Merge Sort' },
            { id: 'quick_sort', name: 'Quick Sort' },
            { id: 'heap_sort', name: 'Heap Sort' },
            { id: 'counting_sort', name: 'Counting Sort' },
            { id: 'radix_sort', name: 'Radix Sort' }
          ].map(algo => (
            <button
              key={algo.id}
              onClick={() => onSelectAlgorithm(algo.id)}
              style={{
                padding: '5px 11px',
                borderRadius: '8px',
                border: activeAlgorithm === algo.id ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                background: activeAlgorithm === algo.id ? 'rgba(56, 189, 248, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                color: activeAlgorithm === algo.id ? '#38bdf8' : 'var(--text-secondary)',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {algo.name}
            </button>
          ))}
        </div>

        {/* Toptal Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>Initial Order:</span>
          {[
            { id: 'random', label: '🎲 Random' },
            { id: 'nearly_sorted', label: '📈 Nearly Sorted' },
            { id: 'reversed', label: '📉 Reversed' },
            { id: 'few_unique', label: '🔁 Few Unique' }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => generatePresetArray(p.id as OrderPreset, arraySize)}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: activePreset === p.id ? '1px solid #a855f7' : '1px solid rgba(255,255,255,0.08)',
                background: activePreset === p.id ? 'rgba(168, 85, 247, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                color: activePreset === p.id ? '#c084fc' : '#94a3b8',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Control Deck */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        background: 'rgba(15, 23, 42, 0.7)',
        padding: '8px 14px',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              background: isPlaying ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff',
              fontWeight: 800,
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            {isPlaying ? 'Pause' : 'Auto Play'}
          </button>

          <button
            onClick={handleStepBackward}
            disabled={currentStep === 0 || isPlaying}
            style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.75rem', cursor: 'pointer', opacity: currentStep === 0 ? 0.4 : 1 }}
          >
            Prev Step
          </button>

          <button
            onClick={handleStepForward}
            disabled={currentStep >= stepsHistoryRef.current.length - 1 || isPlaying}
            style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.75rem', cursor: 'pointer', opacity: currentStep >= stepsHistoryRef.current.length - 1 ? 0.4 : 1 }}
          >
            Next Step
          </button>

          <button
            onClick={handleReset}
            style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <RotateCcw size={12} /> Reset
          </button>
        </div>

        {/* Array Size Slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Size (N): {arraySize}</span>
          <input
            type="range"
            min="10"
            max="35"
            value={arraySize}
            onChange={(e) => setArraySize(parseInt(e.target.value, 10))}
            style={{ width: '90px', accentColor: '#38bdf8' }}
          />
        </div>
      </div>

      {/* Narrative & Metrics */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(2, 132, 199, 0.1)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        padding: '8px 14px',
        borderRadius: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={14} color="#38bdf8" />
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#38bdf8' }}>
            STEP {currentStep} / {Math.max(0, stepsHistoryRef.current.length - 1)}
          </span>
          <span style={{ fontSize: '0.8rem', color: '#f1f5f9', fontWeight: 600 }}>
            {currentLog.description}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '14px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Comparisons: <strong style={{ color: '#38bdf8' }}>{comparisons}</strong>
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Swaps / Shifts: <strong style={{ color: '#f59e0b' }}>{swaps}</strong>
          </span>
        </div>
      </div>

      {/* Main Bar Chart Visualizer */}
      <div style={{
        flex: 1,
        minHeight: '360px',
        background: 'radial-gradient(ellipse at center, #0f172a 0%, #030712 100%)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.08)',
        padding: '24px 18px 12px 18px',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: '4px',
        position: 'relative'
      }}>
        {array.map((bar, idx) => {
          const heightPercent = Math.max(12, bar.value);
          let bg = 'linear-gradient(180deg, #0284c7 0%, #0369a1 100%)';
          let border = '#38bdf8';
          let shadow = '0 0 8px rgba(56, 189, 248, 0.3)';

          if (bar.state === 'comparing') {
            bg = 'linear-gradient(180deg, #facc15 0%, #ca8a04 100%)';
            border = '#fde047';
            shadow = '0 0 16px rgba(250, 204, 21, 0.7)';
          } else if (bar.state === 'swapping') {
            bg = 'linear-gradient(180deg, #ef4444 0%, #b91c1c 100%)';
            border = '#f87171';
            shadow = '0 0 16px rgba(239, 68, 68, 0.8)';
          } else if (bar.state === 'pivot') {
            bg = 'linear-gradient(180deg, #a855f7 0%, #7e22ce 100%)';
            border = '#c084fc';
            shadow = '0 0 16px rgba(168, 85, 247, 0.8)';
          } else if (bar.state === 'sorted') {
            bg = 'linear-gradient(180deg, #10b981 0%, #047857 100%)';
            border = '#34d399';
            shadow = '0 0 8px rgba(16, 185, 129, 0.4)';
          }

          return (
            <div
              key={bar.id}
              style={{
                flex: 1,
                maxWidth: '38px',
                height: `${heightPercent * 2.8}px`,
                background: bg,
                border: `1.5px solid ${border}`,
                borderRadius: '6px 6px 0 0',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '4px 0',
                boxShadow: shadow,
                transition: 'all 0.15s ease'
              }}
            >
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#fff' }}>
                {bar.value}
              </span>
              <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.7)' }}>
                {idx}
              </span>
            </div>
          );
        })}

        {/* Legend */}
        <div style={{
          position: 'absolute',
          bottom: '8px',
          display: 'flex',
          gap: '12px',
          background: 'rgba(3, 7, 18, 0.85)',
          padding: '4px 12px',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          {[
            { label: 'Default', color: '#0284c7' },
            { label: 'Comparing', color: '#facc15' },
            { label: 'Swapping / Shifting', color: '#ef4444' },
            { label: 'Pivot / Gap / Bucket', color: '#a855f7' },
            { label: 'Sorted In Place', color: '#10b981' }
          ].map(leg => (
            <div key={leg.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: leg.color }} />
              <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600 }}>{leg.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
