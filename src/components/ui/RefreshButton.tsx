import { logger } from "@/lib/logger";
import { classNames, unwrapError } from "@/lib/utils";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function RefreshButton({
  refresh,
  refreshOnLoad,
}: {
  refresh: () => Promise<void>;
  refreshOnLoad?: boolean;
}) {
  const [refreshing, setRefreshing] = useState(false);

  const refreshClick = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } catch (error) {
      logger.error(error);
      toast.error(unwrapError(error));
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  useEffect(() => {
    if (refreshOnLoad) refreshClick();
  }, [refreshClick, refreshOnLoad]);

  return (
    <div
      className="mr-4 p-1 hover:bg-gray-100 rounded-md cursor-pointer"
      onClick={refreshing ? undefined : refreshClick}
      data-tooltip-content={refreshing ? "Refreshing..." : "Refresh"}
      data-tooltip-id="tooltip"
    >
      <ArrowPathIcon className={classNames("w-4 h-4", refreshing ? "animate-spin" : "")} />
    </div>
  );
}
