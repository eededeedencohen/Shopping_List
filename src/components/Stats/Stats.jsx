import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import axios from "axios";
import { DOMAIN } from "../../constants";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top",
    },
    title: {
      display: true,
      text: "Purchased Products",
    },
  },
};

export const Stats = () => {
  const [barData, setBarData] = useState();

  useEffect(() => {
    axios.get(`${DOMAIN}/api/v1/history/`).then((res) => {
      console.log(res.data);
      const history = res.data.data.history;
      const productAmounts = {};
      for (const purchase of history) {
        for (const product of purchase.products) {
          console.log(product);
          productAmounts[product.generalName] = productAmounts[
            product.generalName
          ]
            ? productAmounts[product.generalName] + product.amount
            : product.amount;
        }
      }
      console.log(productAmounts);

      const barData = {
        labels: Object.keys(productAmounts),
        datasets: [
          {
            label: "Purchased Products",
            data: Object.values(productAmounts),
            backgroundColor: "rgba(255, 99, 132, 0.5)",
          },
        ],
      };
      setBarData(barData);
    });
  }, []);

  return (
    <div>
      <h1>Stats</h1>
      {barData && <Bar options={options} data={barData} />};
    </div>
  );
};
