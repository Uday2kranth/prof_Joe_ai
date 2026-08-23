import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ArrayBar, StepLog } from '../types';
import { Play, Pause, RotateCcw, Zap, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [arraySize, setArraySize] = useState<number>(8);
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

  // Toptal & VisuAlgo-style Uniform Stepped Order Generator
  const generatePresetArray = useCallback((preset: OrderPreset, size: number) => {
    setActivePreset(preset);
    let values: number[] = [];

    // Generates uniform, evenly stepped values from 12 to 96
    const getSteppedValues = (n: number) => {
      if (n <= 1) return [50];
      return Array.from({ length: n }, (_, i) => Math.round(12 + (i / (n - 1)) * 84));
    };

    if (preset === 'random') {
      values = getSteppedValues(size);
      // Fisher-Yates shuffle for a perfectly unbiased, evenly distributed permutation
      for (let i = values.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = values[i];
        values[i] = values[j];
        values[j] = temp;
      }
    } else if (preset === 'nearly_sorted') {
      values = getSteppedValues(size);
      // Introduce 2-3 slight disorder swaps
      const swapCount = Math.max(1, Math.floor(size * 0.12));
      for (let k = 0; k < swapCount; k++) {
        const i1 = Math.floor(Math.random() * size);
        const i2 = Math.floor(Math.random() * size);
        const tmp = values[i1];
        values[i1] = values[i2];
        values[i2] = tmp;
      }
    } else if (preset === 'reversed') {
      values = getSteppedValues(size).reverse();
    } else if (preset === 'few_unique') {
      // 4 clean, evenly spaced height tiers
      const distinct = [22, 46, 70, 94];
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
      id: `bar-${idx}-${Date.now()}-${Math.random()}`,
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '100%' }}>
      {/* 9 Sorting Algorithms Dropdown & Initial Order Presets */}
      <div className="dsa-header-card" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        background: 'var(--card-bg)',
        padding: '8px 12px',
        borderRadius: '12px',
        border: '1px solid var(--card-border)',
        boxShadow: 'var(--card-shadow)'
      }}>
        {/* Left: Sorting Algorithm Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: '1 1 200px', minWidth: 0, maxWidth: '100%' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0 }}>
            SORT:
          </span>
          <select
            value={activeAlgorithm}
            onChange={(e) => onSelectAlgorithm(e.target.value)}
            className="dsa-select-control"
            style={{
              minHeight: '36px',
              padding: '6px 10px',
              borderRadius: '8px',
              background: 'var(--bg-tertiary)',
              border: '1.5px solid var(--accent-cyan)',
              color: 'var(--text-primary)',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              outline: 'none',
              boxShadow: '0 0 10px var(--cursor-glow)'
            }}
          >
            <option value="bubble_sort">📶 Bubble Sort (Adjacent Swaps)</option>
            <option value="selection_sort">🎯 Selection Sort (Min/Max Scanning)</option>
            <option value="insertion_sort">📥 Insertion Sort (Shift & Insert)</option>
            <option value="shell_sort">🐚 Shell Sort (Diminishing Gap)</option>
            <option value="merge_sort">🔀 Merge Sort (Divide & Conquer O(n log n))</option>
            <option value="quick_sort">⚡ Quick Sort (Lomuto Partitioning)</option>
            <option value="heap_sort">🔺 Heap Sort (Binary Max-Heap)</option>
            <option value="counting_sort">📊 Counting Sort (Non-Comparison O(n+k))</option>
            <option value="radix_sort">🔢 Radix Sort (LSD Bucket Pass)</option>
          </select>
        </div>

        {/* Right: Initial Order Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 700 }}>Order:</span>
          <select
            value={activePreset}
            onChange={(e) => {
              const p = e.target.value as OrderPreset;
              setActivePreset(p);
              generatePresetArray(p, arraySize);
            }}
            style={{
              minHeight: '32px',
              padding: '4px 8px',
              borderRadius: '6px',
              background: 'rgba(30, 41, 59, 0.95)',
              border: '1px solid rgba(168, 85, 247, 0.5)',
              color: '#c084fc',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="random">🎲 Random</option>
            <option value="nearly_sorted">📈 Nearly Sorted</option>
            <option value="reversed">📉 Reversed</option>
            <option value="few_unique">🔁 Few Unique</option>
          </select>
        </div>
      </div>

      {/* Control Deck */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        background: 'var(--card-bg)',
        padding: '6px 12px',
        borderRadius: '10px',
        border: '1px solid var(--card-border)',
        boxShadow: 'var(--card-shadow)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            title={isPlaying ? 'Pause' : 'Auto Play'}
            onClick={() => setIsPlaying(!isPlaying)}
            className="dsa-action-btn"
            style={{
              border: 'none',
              background: isPlaying ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff'
            }}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span className="dsa-btn-label">{isPlaying ? 'Pause' : 'Auto Play'}</span>
          </button>

          <button
            title="Previous Step"
            onClick={handleStepBackward}
            disabled={currentStep === 0 || isPlaying}
            className="dsa-action-btn"
            style={{
              border: '1px solid var(--border-color)',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              opacity: currentStep === 0 ? 0.4 : 1
            }}
          >
            <ChevronLeft size={14} />
            <span className="dsa-btn-label">Prev</span>
          </button>

          <button
            title="Next Step"
            onClick={handleStepForward}
            disabled={currentStep >= stepsHistoryRef.current.length - 1 || isPlaying}
            className="dsa-action-btn"
            style={{
              border: '1px solid var(--border-color)',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              opacity: currentStep >= stepsHistoryRef.current.length - 1 ? 0.4 : 1
            }}
          >
            <ChevronRight size={14} />
            <span className="dsa-btn-label">Next</span>
          </button>

          <button
            title="Reset Array"
            onClick={handleReset}
            className="dsa-action-btn"
            style={{
              border: '1px solid var(--border-color)',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-muted)'
            }}
          >
            <RotateCcw size={13} />
            <span className="dsa-btn-label">Reset</span>
          </button>
        </div>

        {/* Array Size Slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>N: <strong style={{ color: 'var(--accent-cyan)' }}>{arraySize}</strong></span>
          <input
            type="range"
            min="5"
            max="25"
            value={arraySize}
            onChange={(e) => setArraySize(parseInt(e.target.value, 10))}
            style={{ width: '70px', accentColor: 'var(--accent-cyan)' }}
          />
        </div>
      </div>

      {/* Narrative & Metrics */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--pill-active-bg)',
        border: '1px solid var(--card-border)',
        padding: '6px 12px',
        borderRadius: '8px',
        gap: '8px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flex: 1 }}>
          <Zap size={14} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--accent-cyan)', flexShrink: 0 }}>
            {currentStep}/{Math.max(0, stepsHistoryRef.current.length - 1)}
          </span>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-primary)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentLog.description}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
            C: <strong style={{ color: '#38bdf8' }}>{comparisons}</strong>
          </span>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
            S: <strong style={{ color: '#f59e0b' }}>{swaps}</strong>
          </span>
        </div>
      </div>

      {/* Main Bar Chart Visualizer Board */}
      <div style={{
        flex: 1,
        minHeight: '260px',
        background: 'radial-gradient(ellipse at center, #0f172a 0%, #030712 100%)',
        borderRadius: '14px',
        border: '1px solid rgba(255,255,255,0.08)',
        padding: '16px 12px 8px 12px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '8px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: array.length > 15 ? '2px' : '4px',
          flex: 1,
          width: '100%',
          minHeight: '180px'
        }}>
          {(() => {
            const allVals = array.map(b => b.value);
            const minV = Math.min(...allVals, 1);
            const maxV = Math.max(...allVals, 100);
            const range = maxV === minV ? 1 : (maxV - minV);

            return array.map((bar, idx) => {
              const heightPercent = 18 + ((bar.value - minV) / range) * 76;
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
                    flex: '1 1 0',
                    maxWidth: array.length > 15 ? '22px' : '42px',
                    minWidth: '4px',
                    height: `${heightPercent}%`,
                    background: bg,
                    border: `1.5px solid ${border}`,
                    borderRadius: '6px 6px 0 0',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '3px 0',
                    boxShadow: shadow,
                    transition: 'all 0.15s ease'
                  }}
                >
                  {array.length <= 15 ? (
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                      {bar.value}
                    </span>
                  ) : null}
                  <span style={{ fontSize: '0.55rem', fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>
                    {idx}
                  </span>
                </div>
              );
            });
          })()}
        </div>

        {/* Non-Overlapping Bottom Legend */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          justifyContent: 'center',
          background: 'rgba(3, 7, 18, 0.7)',
          padding: '4px 10px',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.06)'
        }}>
          {[
            { label: 'Default', color: '#0284c7' },
            { label: 'Comparing', color: '#facc15' },
            { label: 'Swapping', color: '#ef4444' },
            { label: 'Pivot', color: '#a855f7' },
            { label: 'Sorted', color: '#10b981' }
          ].map(leg => (
            <div key={leg.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '2px', background: leg.color }} />
              <span style={{ fontSize: '0.64rem', color: '#94a3b8', fontWeight: 600 }}>{leg.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
