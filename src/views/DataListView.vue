<template>
  <div class="data-list-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>数据列表</span>
          <el-button @click="$router.push('/')" text type="primary">
            <el-icon><Back /></el-icon>
            返回首页
          </el-button>
        </div>
      </template>

      <!-- 视图切换 -->
      <el-radio-group v-model="dataStore.currentView" class="view-switch">
        <el-radio-button value="all">合并视图</el-radio-button>
        <el-radio-button value="events">仅事件</el-radio-button>
        <el-radio-button value="sensors">仅传感器</el-radio-button>
      </el-radio-group>

      <!-- 数据表格 -->
      <el-table
        :data="tableData"
        stripe
        style="width: 100%; margin-top: 20px"
        v-loading="loading"
      >
        <el-table-column type="index" label="序号" width="80" />
        <el-table-column label="数据类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.dataType === 'event' ? 'primary' : 'success'">
              {{ row.dataType === 'event' ? '城市事件' : '传感器' }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 事件列 -->
        <template v-if="dataStore.currentView === 'events' || dataStore.currentView === 'all'">
          <el-table-column v-if="showEventColumns" prop="type" label="事件类型" width="120" />
          <el-table-column v-if="showEventColumns" prop="description" label="描述" min-width="200" />
          <el-table-column v-if="showEventColumns" label="位置" width="150">
            <template #default="{ row }">
              {{ row.location.district }}
            </template>
          </el-table-column>
          <el-table-column v-if="showEventColumns" prop="reportTime" label="上报时间" width="180" />
          <el-table-column v-if="showEventColumns" prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
        </template>

        <!-- 传感器列 -->
        <template v-if="dataStore.currentView === 'sensors' || dataStore.currentView === 'all'">
          <el-table-column v-if="showSensorColumns" prop="type" label="传感器类型" width="120" />
          <el-table-column v-if="showSensorColumns" label="数值" width="120">
            <template #default="{ row }">
              {{ row.value }}{{ row.unit }}
              <el-icon v-if="row.status === '异常'" color="#f56c6c">
                <Warning />
              </el-icon>
            </template>
          </el-table-column>
          <el-table-column v-if="showSensorColumns" label="位置" width="150">
            <template #default="{ row }">
              {{ row.location.district }}
            </template>
          </el-table-column>
          <el-table-column v-if="showSensorColumns" prop="timestamp" label="采集时间" width="180" />
          <el-table-column v-if="showSensorColumns" prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === '异常' ? 'danger' : 'success'">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
        </template>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useDataStore } from '@/stores/data';

const dataStore = useDataStore();

const currentPage = ref(1);
const pageSize = ref(20);
const loading = ref(false);

const showEventColumns = computed(() =>
  dataStore.currentView === 'events' || dataStore.currentView === 'all'
);

const showSensorColumns = computed(() =>
  dataStore.currentView === 'sensors' || dataStore.currentView === 'all'
);

const tableData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return dataStore.mergedData.slice(start, end);
});

const total = computed(() => dataStore.mergedData.length);

function getStatusType(status: string) {
  const typeMap: Record<string, any> = {
    '未处理': 'info',
    '处理中': 'warning',
    '已派单': 'primary',
    '紧急': 'danger',
    '核查中': 'warning'
  };
  return typeMap[status] || '';
}

onMounted(() => {
  if (dataStore.cityEvents.length === 0) {
    // 自动加载示例数据
    fetch('./city_events.json')
      .then(res => res.json())
      .then((data: any) => {
        dataStore.loadCityEvents(data);
      });
    fetch('./sensor_data.json')
      .then(res => res.json())
      .then((data: any) => {
        dataStore.loadSensorData(data);
      });
  }
});
</script>

<style scoped>
.data-list-container {
  width: 100%;
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
}

.view-switch {
  margin-bottom: 20px;
}
</style>
