import moment from 'moment-timezone';
import _ from 'lodash';
import Order from '../data/orderModel';
import Event from '../data/eventModel';
import logger from '../util/logger';
import chalk from 'chalk';

const findEventOrdersByDateRange = async (eventId, startDate, endDate) => new Promise((resolve, reject) => {
  Order.find({ event: eventId, createdDate: { $gt: startDate, $lt: endDate } })
    .then(orders => { resolve(orders) })
    .catch(err => reject(err));
});

const eventOrdersByDate = async (eventId, date) => {
  const orders = await findEventOrdersByDateRange(eventId, date, moment(date).add(1, 'days'));
  let ordersByDate = null;

  if (orders) {
    await Event.findOne({ _id: eventId }).then(result => {
      if (result) {
        ordersByDate = {
          event: result.name,
          bookings: orders.length,
          revenue: _.sumBy(orders, 'total'),
          createdDate: moment(date).toDate(),
        };
      }
    }).catch(err => logger.error(err));
  }

  return ordersByDate;
};

const OrderService = {
  eventOrdersByDateRange: async (event, startDate, endDate) => {
    const dailyOrdersOfDateRange = [];
    let totalBookings = 0;
    let totalRevenue = 0;

    for (let i = moment(startDate).day(); i < moment(endDate).day() - moment(startDate).day(); i += 1) {

    }
  },

  eventOrdersByDayOfWeek: async (event, startDateOfWeek) => {

    const dailyOrders = [];
    let totalBookings = 0;
    let totalRevenue = 0;

    for (let i = 0; i < 7; i += 1) {
      let ordersOfDate = await eventOrdersByDate(event._id, moment(startDateOfWeek).add(i, 'days'));
      let day = moment(startDateOfWeek).add(i, 'days').format('ddd');
      dailyOrders.push({ [day]: ordersOfDate });
      totalBookings += ordersOfDate.bookings;
      totalRevenue += ordersOfDate.revenue;
    }

    const ordersByWeek = {
      eventId = event._id,
      eventName = event.name,
      dailyOrders,
      totalBookings,
      totalRevenue,
    }

    return ordersByWeek;
  },
}
module.exports = OrderService;
