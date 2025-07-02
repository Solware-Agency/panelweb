import React, { useState, useEffect } from 'react'
import { supabase } from '@lib/supabase/config'
import { Card } from '@shared/components/ui/card'
import { Button } from '@shared/components/ui/button'
import { AlertCircle, Database, ShieldCheck, RefreshCw } from 'lucide-react'
import { useAuth } from '@app/providers/AuthContext'
import { useUserProfile } from '@shared/hooks/useUserProfile'

const CasesTableDebug: React.FC = () => {
  const { user } = useAuth()
  const { profile } = useUserProfile()
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [showRawData, setShowRawData] = useState(false)

  const runDiagnostics = async () => {
    setIsLoading(true)
    setError(null)
    setResults(null)

    try {
      // Test 1: Basic connection test
      const connectionTest = await supabase.from('medical_records_clean').select('count', { count: 'exact', head: true })
      
      // Test 2: Try to fetch a small number of records
      const { data: records, error: recordsError } = await supabase
        .from('medical_records_clean')
        .select('*')
        .limit(5)
      
      // Test 3: Check if the user has the correct permissions
      const { data: userPermissions, error: permissionsError } = await supabase.rpc('get_my_claims')
      
      // Test 4: Check if the branch filter is working correctly
      const branchFilter = profile?.assigned_branch || 'all'
      const { data: branchRecords, error: branchError } = branchFilter !== 'all' 
        ? await supabase
            .from('medical_records_clean')
            .select('id, branch')
            .eq('branch', branchFilter)
            .limit(5)
        : await supabase
            .from('medical_records_clean')
            .select('id, branch')
            .limit(5)
      
      // Test 5: Check if the biopsy-related columns exist
      const { data: columnInfo, error: columnError } = await supabase
        .from('medical_records_clean')
        .select('material_remitido, diagnostico')
        .limit(1)
      
      setResults({
        connectionTest: {
          success: !connectionTest.error,
          count: connectionTest.count,
          error: connectionTest.error
        },
        recordsTest: {
          success: !recordsError,
          count: records?.length || 0,
          error: recordsError
        },
        permissionsTest: {
          success: !permissionsError,
          data: userPermissions,
          error: permissionsError
        },
        branchTest: {
          success: !branchError,
          count: branchRecords?.length || 0,
          filter: branchFilter,
          error: branchError
        },
        columnTest: {
          success: !columnError,
          data: columnInfo,
          error: columnError
        },
        rawData: records
      })
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Database className="text-primary" />
          CasesTable Diagnostics
        </h2>
        <Button 
          onClick={runDiagnostics} 
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Run Diagnostics
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-md mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <p className="font-medium">Error running diagnostics</p>
          </div>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      )}

      {results && (
        <div className="space-y-4">
          {/* Connection Test */}
          <div className={`p-4 rounded-md border ${results.connectionTest.success ? 'bg-green-100 dark:bg-green-900/30 border-green-400 dark:border-green-800' : 'bg-red-100 dark:bg-red-900/30 border-red-400 dark:border-red-800'}`}>
            <h3 className="font-medium flex items-center gap-2">
              {results.connectionTest.success ? (
                <span className="text-green-700 dark:text-green-300">✓ Database Connection</span>
              ) : (
                <span className="text-red-700 dark:text-red-300">✗ Database Connection</span>
              )}
            </h3>
            <p className="text-sm mt-1">
              {results.connectionTest.success 
                ? `Successfully connected to database. Total records: ${results.connectionTest.count}`
                : `Failed to connect to database: ${results.connectionTest.error?.message || 'Unknown error'}`
              }
            </p>
          </div>

          {/* Records Test */}
          <div className={`p-4 rounded-md border ${results.recordsTest.success ? 'bg-green-100 dark:bg-green-900/30 border-green-400 dark:border-green-800' : 'bg-red-100 dark:bg-red-900/30 border-red-400 dark:border-red-800'}`}>
            <h3 className="font-medium flex items-center gap-2">
              {results.recordsTest.success ? (
                <span className="text-green-700 dark:text-green-300">✓ Records Retrieval</span>
              ) : (
                <span className="text-red-700 dark:text-red-300">✗ Records Retrieval</span>
              )}
            </h3>
            <p className="text-sm mt-1">
              {results.recordsTest.success 
                ? `Successfully retrieved ${results.recordsTest.count} records`
                : `Failed to retrieve records: ${results.recordsTest.error?.message || 'Unknown error'}`
              }
            </p>
          </div>

          {/* Permissions Test */}
          <div className={`p-4 rounded-md border ${results.permissionsTest.success ? 'bg-green-100 dark:bg-green-900/30 border-green-400 dark:border-green-800' : 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-400 dark:border-yellow-800'}`}>
            <h3 className="font-medium flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              {results.permissionsTest.success ? (
                <span className="text-green-700 dark:text-green-300">User Permissions</span>
              ) : (
                <span className="text-yellow-700 dark:text-yellow-300">User Permissions</span>
              )}
            </h3>
            <div className="text-sm mt-1">
              <p>User ID: {user?.id || 'Not logged in'}</p>
              <p>Email: {user?.email || 'N/A'}</p>
              <p>Role: {profile?.role || 'Unknown'}</p>
              <p>Assigned Branch: {profile?.assigned_branch || 'None'}</p>
            </div>
          </div>

          {/* Branch Test */}
          <div className={`p-4 rounded-md border ${results.branchTest.success ? 'bg-green-100 dark:bg-green-900/30 border-green-400 dark:border-green-800' : 'bg-red-100 dark:bg-red-900/30 border-red-400 dark:border-red-800'}`}>
            <h3 className="font-medium flex items-center gap-2">
              {results.branchTest.success ? (
                <span className="text-green-700 dark:text-green-300">✓ Branch Filtering</span>
              ) : (
                <span className="text-red-700 dark:text-red-300">✗ Branch Filtering</span>
              )}
            </h3>
            <p className="text-sm mt-1">
              {results.branchTest.success 
                ? `Branch filter "${results.branchTest.filter}" returned ${results.branchTest.count} records`
                : `Failed to filter by branch: ${results.branchTest.error?.message || 'Unknown error'}`
              }
            </p>
          </div>

          {/* Column Test */}
          <div className={`p-4 rounded-md border ${results.columnTest.success ? 'bg-green-100 dark:bg-green-900/30 border-green-400 dark:border-green-800' : 'bg-red-100 dark:bg-red-900/30 border-red-400 dark:border-red-800'}`}>
            <h3 className="font-medium flex items-center gap-2">
              {results.columnTest.success ? (
                <span className="text-green-700 dark:text-green-300">✓ Biopsy Columns</span>
              ) : (
                <span className="text-red-700 dark:text-red-300">✗ Biopsy Columns</span>
              )}
            </h3>
            <p className="text-sm mt-1">
              {results.columnTest.success 
                ? `Biopsy-related columns exist in the database`
                : `Missing biopsy columns: ${results.columnTest.error?.message || 'Unknown error'}`
              }
            </p>
          </div>

          {/* Raw Data Toggle */}
          <div className="mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowRawData(!showRawData)}
            >
              {showRawData ? 'Hide Raw Data' : 'Show Raw Data'}
            </Button>
            
            {showRawData && results.rawData && (
              <div className="mt-2 p-4 bg-gray-100 dark:bg-gray-800 rounded-md overflow-auto max-h-96">
                <pre className="text-xs">{JSON.stringify(results.rawData, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
        <p>This diagnostic tool helps identify issues with the CasesTable component.</p>
        <p>User: {user?.email || 'Not logged in'} | Role: {profile?.role || 'Unknown'}</p>
      </div>
    </Card>
  )
}

export default CasesTableDebug