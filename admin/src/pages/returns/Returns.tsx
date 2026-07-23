import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  getReturns,
  getReturnSummary,
  processReturn,
  retryReturn,
  ReturnSubscription,
  ReturnSummary,
} from '../../services/returnService';

const emptySummary: ReturnSummary = {
  pending: {
    count: 0,
    amount: 0,
  },

  processing: {
    count: 0,
    amount: 0,
  },

  failed: {
    count: 0,
    amount: 0,
  },

  credited: {
    count: 0,
    amount: 0,
  },

  overdue: {
    count: 0,
    amount: 0,
  },
};

const Returns = () => {
  const [summary, setSummary] =
    useState<ReturnSummary>(
      emptySummary,
    );

  const [returns, setReturns] =
    useState<ReturnSubscription[]>([]);

  const [status, setStatus] =
    useState('all');

  const [search, setSearch] =
    useState('');

  const [page, setPage] =
    useState(1);

  const [totalPages, setTotalPages] =
    useState(1);

  const [loading, setLoading] =
    useState(true);

  const [
    processingId,
    setProcessingId,
  ] = useState<string | null>(null);

  const [error, setError] =
    useState('');

  const loadData = useCallback(
    async () => {
      try {
        setLoading(true);
        setError('');

        const [
          summaryData,
          returnData,
        ] = await Promise.all([
          getReturnSummary(),

          getReturns({
            status,
            search,
            page,
            limit: 20,
          }),
        ]);

        setSummary(summaryData);

        setReturns(
          returnData.returns || [],
        );

        setTotalPages(
          returnData.pagination
            ?.totalPages || 1,
        );
      } catch (err: any) {
        setError(
          err.response?.data
            ?.message ||
            'Unable to load returns',
        );
      } finally {
        setLoading(false);
      }
    },
    [status, search, page],
  );

  useEffect(() => {
    const timeout = setTimeout(
      () => {
        loadData();
      },
      350,
    );

    return () =>
      clearTimeout(timeout);
  }, [loadData]);

  const handleProcess = async (
    subscription:
      ReturnSubscription,
  ) => {
    const confirmed =
      window.confirm(
        `Credit ₹${subscription.returnAmount.toFixed(
          2,
        )} to ${subscription.user.fullName}?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(
        subscription._id,
      );

      await processReturn(
        subscription._id,
      );

      await loadData();
    } catch (err: any) {
      alert(
        err.response?.data?.message ||
          'Return processing failed',
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleRetry = async (
    subscription:
      ReturnSubscription,
  ) => {
    try {
      setProcessingId(
        subscription._id,
      );

      await retryReturn(
        subscription._id,
      );

      await loadData();
    } catch (err: any) {
      alert(
        err.response?.data?.message ||
          'Return retry failed',
      );
    } finally {
      setProcessingId(null);
    }
  };

  const currency = (
    amount: number,
  ) =>
    `₹${Number(
      amount || 0,
    ).toFixed(2)}`;

  const formatDate = (
    value?: string,
  ) => {
    if (!value) {
      return '-';
    }

    return new Date(
      value,
    ).toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      },
    );
  };

  return (
    <div className="returns-page">
      <div className="page-header">
        <div>
          <h1>Returns</h1>

          <p>
            Monitor and process
            subscription maturity
            returns.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}>
          Refresh
        </button>
      </div>

      <div className="return-stats">
        <ReturnCard
          title="Pending"
          metric={summary.pending}
        />

        <ReturnCard
          title="Processing"
          metric={summary.processing}
        />

        <ReturnCard
          title="Failed"
          metric={summary.failed}
        />

        <ReturnCard
          title="Overdue"
          metric={summary.overdue}
        />

        <ReturnCard
          title="Credited"
          metric={summary.credited}
        />
      </div>

      <div className="return-filters">
        <input
          type="search"
          placeholder="Search user or email"
          value={search}
          onChange={event => {
            setSearch(
              event.target.value,
            );

            setPage(1);
          }}
        />

        <select
          value={status}
          onChange={event => {
            setStatus(
              event.target.value,
            );

            setPage(1);
          }}>
          <option value="all">
            All Returns
          </option>

          <option value="Pending">
            Pending
          </option>

          <option value="Processing">
            Processing
          </option>

          <option value="Failed">
            Failed
          </option>

          <option value="Credited">
            Credited
          </option>
        </select>
      </div>

      {error ? (
        <div className="error-box">
          {error}
        </div>
      ) : null}

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Plan</th>
              <th>Paid</th>
              <th>Return</th>
              <th>Maturity Date</th>
              <th>Overdue</th>
              <th>Status</th>
              <th>Wallet</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {!loading &&
            returns.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="empty-cell">
                  No returns found.
                </td>
              </tr>
            ) : null}

            {returns.map(item => {
              const isWorking =
                processingId ===
                item._id;

              const canProcess =
                item.returnStatus ===
                  'Pending' &&
                item.overdueDays >= 0;

              const canRetry =
                item.returnStatus ===
                'Failed';

              return (
                <tr key={item._id}>
                  <td>
                    <strong>
                      {item.user
                        ?.fullName ||
                        'User'}
                    </strong>

                    <small>
                      {item.user
                        ?.email}
                    </small>
                  </td>

                  <td>
                    {item.plan
                      ?.title ||
                      'Plan'}
                  </td>

                  <td>
                    {currency(
                      item.amountPaid,
                    )}
                  </td>

                  <td className="return-value">
                    {currency(
                      item.returnAmount,
                    )}
                  </td>

                  <td>
                    {formatDate(
                      item.endDate,
                    )}
                  </td>

                  <td>
                    {item.overdueDays > 0
                      ? `${item.overdueDays} days`
                      : '-'}
                  </td>

                  <td>
                    <span
                      className={`status-badge status-${item.returnStatus.toLowerCase()}`}>
                      {
                        item.returnStatus
                      }
                    </span>

                    {item.returnFailureReason ? (
                      <small className="failure-reason">
                        {
                          item.returnFailureReason
                        }
                      </small>
                    ) : null}
                  </td>

                  <td>
                    {currency(
                      item.user
                        ?.walletBalance,
                    )}
                  </td>

                  <td>
                    {canProcess ? (
                      <button
                        type="button"
                        disabled={
                          isWorking
                        }
                        onClick={() =>
                          handleProcess(
                            item,
                          )
                        }>
                        {isWorking
                          ? 'Processing...'
                          : 'Process'}
                      </button>
                    ) : null}

                    {canRetry ? (
                      <button
                        type="button"
                        disabled={
                          isWorking
                        }
                        onClick={() =>
                          handleRetry(
                            item,
                          )
                        }>
                        {isWorking
                          ? 'Retrying...'
                          : 'Retry'}
                      </button>
                    ) : null}

                    {item.returnStatus ===
                    'Credited' ? (
                      <span className="completed-text">
                        Completed
                      </span>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() =>
            setPage(value =>
              Math.max(
                value - 1,
                1,
              ),
            )
          }>
          Previous
        </button>

        <span>
          Page {page} of{' '}
          {totalPages}
        </span>

        <button
          type="button"
          disabled={
            page >= totalPages
          }
          onClick={() =>
            setPage(value =>
              value + 1,
            )
          }>
          Next
        </button>
      </div>
    </div>
  );
};

interface ReturnCardProps {
  title: string;

  metric: {
    count: number;
    amount: number;
  };
}

const ReturnCard = ({
  title,
  metric,
}: ReturnCardProps) => (
  <div className="return-stat-card">
    <span>{title}</span>

    <strong>
      {metric.count}
    </strong>

    <small>
      ₹
      {Number(
        metric.amount || 0,
      ).toFixed(2)}
    </small>
  </div>
);

export default Returns;