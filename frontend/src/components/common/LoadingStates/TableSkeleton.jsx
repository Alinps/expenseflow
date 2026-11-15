import Skeleton from "../Loading/Skeleton";
import styles from "./LoadingStates.module.css";

function TableSkeleton({ rows = 5, columns = 5 }) {
    return (
        <div className={styles.tableWrapper} aria-label="Loading table">
            <div 
                className={styles.tableHeader}
                style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
                {Array.from({ length: columns }).map((_, index) => (
                    <Skeleton
                        key={index}
                        width="70%"
                        height="16px"
                    />
                ))}
            </div>

            {Array.from({ length: rows }).map((_, rowIndex) => (
              <div
                    className={styles.tableRow}
                    key={rowIndex}
                    style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
                        
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <Skeleton
                            key={colIndex}
                            width={colIndex === 0 ? "85%" : "65%"}
                            height="16px"
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

export default TableSkeleton;