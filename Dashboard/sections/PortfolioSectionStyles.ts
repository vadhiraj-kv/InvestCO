import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  investmentDetails: {
    marginBottom: 16,
  },
  investmentAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  investmentType: {
    fontSize: 14,
    color: '#666',
  },
  allocationContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  allocationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  allocationSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  allocationChart: {
    marginBottom: 16,
  },
  barChart: {
    height: 40,
    flexDirection: 'row',
    borderRadius: 6,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  barLabel: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
    width: '100%',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#333',
  },
  riskIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  riskLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  riskBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  riskBadgeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  changeRiskButton: {
    marginLeft: 'auto',
    backgroundColor: '#7F00FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  changeRiskText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  recommendationsContainer: {
    marginTop: 8,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  fundCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    width: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  fundName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    height: 40,
  },
  fundMeta: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  fundCategory: {
    fontSize: 10,
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  fundDetails: {
    marginBottom: 4,
  },
  navValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  changeValue: {
    fontSize: 12,
    fontWeight: '500',
  },
  fundReturn: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
    marginTop: 4,
  },
  loadingContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  lastUpdatedText: {
    fontSize: 10,
    color: '#999',
    marginTop: 8,
    textAlign: 'right',
  },
  username: {
    fontSize: 16,
    fontWeight: '500',
    color: '#7F00FF',
  },
  recommendationsSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  fundsScrollContent: {
    paddingRight: 16,
  },
});

export default styles;








