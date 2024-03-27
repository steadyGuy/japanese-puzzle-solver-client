/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useRef, useState } from "react";
import JSONEditor, { JSONEditorOptions } from "jsoneditor";
import "jsoneditor/dist/jsoneditor.min.css";
import { solution10x10, solution7x7 } from "./solutions";
import ax from "./utils";
import MatrixSizeSelector from "./MatrixSizeSelector";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";

function App() {
  const [matrixId, setMatrixId] = useState("");
  const [loading, setLoading] = useState(false);
  const [jsonData, setJsonData] = useState<Record<string, string>[] | null>(
    solution10x10
  );
  const [matrixSize, setMatrixSize] = useState(10);
  const editor = useRef<JSONEditor | null>(null);
  const handleLoad10x10 = () => {
    setJsonData(solution10x10);
    setMatrixSize(10);
    setMatrixId(Math.random().toString());
  };

  const handleLoad7x7 = () => {
    setJsonData(solution7x7);
    setMatrixSize(7);
    setMatrixId(Math.random().toString());
  };

  const handleChangeMatrixSize = (size: number) => {
    setJsonData(null);
    setMatrixSize(size);
  };

  useEffect(() => {
    // create the editor
    if (editor.current) return;
    const container = document.getElementById("json-editor");
    if (!container) return;
    const options = {
      mode: "view" as JSONEditorOptions["mode"],
    };
    editor.current = new JSONEditor(container, options);

    editor.current.set(jsonData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    editor.current?.set(jsonData);
  }, [jsonData]);

  const handleSolve = async () => {
    try {
      setLoading(true);
      const res = await ax.post("/solve", { coordinates: jsonData });

      res.data.forEach((itm: string[], i: number) => {
        itm.forEach((cell, j) => {
          let color = cell;
          if (cell.includes("/")) {
            color = cell.split("/")[0];
          }
          const el = document.querySelector(`.cell-${j}-${i}`) as HTMLElement;
          if (!el) return;
          el.style.backgroundColor = color === "B" ? "#555555" : "";
        });
      });
    } catch (error: any) {
      toast.error(
        error?.response?.data?.detail || error?.response?.data?.detail[0].msg
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLoadRandom = async () => {
    try {
      setLoading(true);
      setMatrixId(Math.random().toString());
      const res = await ax.get(`/generate?num=${matrixSize}`);
      console.log(res.data);
      setJsonData(res.data);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.detail || error?.response?.data?.detail[0].msg
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="wrapper">
        <div>
          <p>
            Coordinate system. Each of the object represents a <b>"room"</b>. A
            room have cells. A <b>cell</b> can be empty or have a symbol{" "}
            <b>"S"</b> or <b>"A"</b>.
          </p>
          <div id="json-editor" />
          <button style={{ marginTop: 24 }} onClick={handleLoad10x10}>
            Load standard 10x10
          </button>
          <button
            style={{ marginTop: 24, marginLeft: 12 }}
            onClick={handleLoad7x7}
          >
            Load standard 7x7
          </button>
          <br />
          <button
            style={{ marginTop: 6 }}
            onClick={handleSolve}
            disabled={loading}
          >
            Solve
          </button>
          <button
            style={{ marginTop: 6, marginLeft: 12 }}
            onClick={handleLoadRandom}
            disabled={loading}
          >
            Load random (size: {matrixSize}x{matrixSize})
          </button>
          <br />
          <br />
          <MatrixSizeSelector
            matrixSize={matrixSize}
            setMatrixSize={handleChangeMatrixSize}
          />
        </div>
        <div
          className="table"
          style={{ gridTemplateColumns: `repeat(${matrixSize}, 1fr)` }}
        >
          {jsonData
            ? jsonData
                .map((itm) => {
                  const coords = Object.keys(itm);
                  const data = Object.entries(itm).map(([key, value]) => {
                    const [x, y] = key.split(",").map(Number);
                    return {
                      key: key,
                      v: {
                        value,
                        bt: coords.includes(`${x},${y - 1}`) ? 0 : 1,
                        bb: coords.includes(`${x},${y + 1}`) ? 0 : 1,
                        br: coords.includes(`${x + 1},${y}`) ? 0 : 1,
                        bl: coords.includes(`${x - 1},${y}`) ? 0 : 1,
                      },
                    };
                  });

                  return data;
                })
                .flat()
                .sort((a, b) => {
                  const [x1] = a.key.split(",").map(Number);
                  const [x2] = b.key.split(",").map(Number);
                  return x1 - x2;
                })
                .sort((a, b) => {
                  const [__, y1] = a.key.split(",").map(Number);
                  const [_, y2] = b.key.split(",").map(Number);
                  return y1 - y2;
                })
                .map((itm, idx) => {
                  const [x, y] = itm.key.split(",").map(Number);
                  return (
                    <div
                      key={`${x}-${y}-${idx}-${matrixSize}-${matrixId}`}
                      className={`cell cell-${x}-${y}`}
                      style={{
                        backgroundColor: "white",
                        borderTop: itm.v.bt ? "1px solid black" : undefined,
                        borderBottom: itm.v.bb ? "1px solid black" : undefined,
                        borderRight: itm.v.br ? "1px solid black" : undefined,
                        borderLeft: itm.v.bl ? "1px solid black" : undefined,
                      }}
                    >
                      {itm.v.value === "" ? (
                        <span style={{ opacity: 0 }}>F</span>
                      ) : (
                        itm.v.value
                      )}
                    </div>
                  );
                })
            : null}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default App;
