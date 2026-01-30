"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

export const StakingPoolComponent = () => {
  const { address } = useAccount();

  // Read from contract
  const { data: value } = useScaffoldContractRead({
    contractName: "StakingPool",
    functionName: "getValue", // Change to your read function
  });

  // Write to contract
  const { writeAsync: writeValue } = useScaffoldContractWrite({
    contractName: "StakingPool",
    functionName: "setValue", // Change to your write function
    args: [0n], // Add your arguments
  });

  const handleWrite = async () => {
    try {
      await writeValue();
      notification.success("Transaction successful!");
    } catch (error) {
      notification.error("Transaction failed");
      console.error(error);
    }
  };

  return (
    <div className="card w-96 bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">StakingPool</h2>

        {address ? (
          <>
            <div className="stats shadow">
              <div className="stat">
                <div className="stat-title">Current Value</div>
                <div className="stat-value">{value?.toString() || "0"}</div>
              </div>
            </div>

            <div className="card-actions justify-end">
              <button className="btn btn-primary" onClick={handleWrite}>
                Update Value
              </button>
            </div>
          </>
        ) : (
          <p>Please connect your wallet</p>
        )}
      </div>
    </div>
  );
};
