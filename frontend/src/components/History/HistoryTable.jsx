import "./HistoryTable.css";

export default function HistoryTable({

  title,
  data,
  page,
  totalPages,
  setPage

}){

  return(

    <div className="history-section">

      <h3>{title}</h3>

      <table className="history-table">

        <thead>

          <tr>

            <th>Type</th>

            <th>Weight</th>

            <th>Status</th>

            <th>Date</th>

          </tr>

        </thead>


        <tbody>

          {data.length === 0 ? (

            <tr>
              <td colSpan="4">
                No data
              </td>
            </tr>

          ) : (

            data.map(item=>(

              <tr key={item._id}>

                <td>
                  {item.type || item.crop}
                </td>

                <td>
                  {item.weight}
                </td>

                <td>
                    <span className="status-badge">
                        {item.status}
                    </span>
                </td>


                <td>
                  {new Date(item.createdAt)
                  .toLocaleDateString()}
                </td>

              </tr>

            ))

          )}

        </tbody>

      </table>


      <div className="pagination">

        <button
          onClick={()=>setPage(page-1)}
          disabled={page===1}
        >
          Prev
        </button>


        <span>
          Page {page} of {totalPages}
        </span>


        <button
          onClick={()=>setPage(page+1)}
          disabled={page===totalPages}
        >
          Next
        </button>

      </div>

    </div>

  );

}
