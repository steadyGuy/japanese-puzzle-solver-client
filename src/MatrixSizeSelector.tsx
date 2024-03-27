type MatrixSizeSelectorProps = {
  matrixSize: number;
  setMatrixSize: (size: number) => void;
};

const MatrixSizeSelector = ({
  matrixSize,
  setMatrixSize,
}: MatrixSizeSelectorProps) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSizeChange = (e: any) => {
    setMatrixSize(parseInt(e.target.value));
  };

  const renderOptions = () => {
    const options = [];
    for (let size = 5; size <= 22; size++) {
      options.push(
        <option key={size} value={size}>{`${size}x${size}`}</option>
      );
    }
    return options;
  };

  return (
    <div>
      <label htmlFor="matrixSize">Select Matrix Size:</label>
      <select id="matrixSize" value={matrixSize} onChange={handleSizeChange}>
        {renderOptions()}
      </select>
      <p>
        Selected Matrix Size: {matrixSize}x{matrixSize}
      </p>
    </div>
  );
};

export default MatrixSizeSelector;
