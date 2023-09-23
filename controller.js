const postgres = require('./postgres');
const { v4: uuidv4 } = require('uuid');

const slotTimeGenerator = (slotDays) => {
    let startDate = new Date();
    startDate.setUTCHours(10,0,0,0);
    startDate = startDate.setDate(startDate.getDate() + 1);
    let i = 1;
    while (i < 32) {
        startDate = new Date(startDate);
        const day = startDate.getDay();
        if (day === 4 || day === 5) {
            slotDays.push(startDate.getTime().toString());
        }
        startDate = startDate.setDate(startDate.getDate() + 1);
        i = i+1;
    }
}

const getDeanSlots = async (uiddean) => {
    const argDate = new Date();
    const userResult = await postgres.getSlotInfoDean(uiddean, argDate.getTime());
        const deanRows = userResult.rows;
        const deanTime = deanRows.map((item) => {
            return item.time;
        })
    return deanTime;
}

const getDeanSlotsDetails = async (uiddean) => {
    const argDate = new Date();
    const userResult = await postgres.getSlotInfoDean(uiddean, argDate.getTime());
        const deanRows = userResult.rows;
    return deanRows;
}

const getStudentSlotsDetails = async (uidstudent) => {
    const argDate = new Date();
    const userResult = await postgres.getSlotInfoStudent(uidstudent, argDate.getTime());
        const studentRows = userResult.rows;
    return studentRows;
}

const existUser = async (uid) => {
    const userResult = await postgres.existUser(uid);
    if (userResult.rows.length === 0) {
        return false
    }
    return true
};

const registerUser = async (body) => {
    const {uid, password, role} = body;
    if (uid && password && role) {
        const existUserDetails = await existUser(uid)
        if (existUserDetails) {
            return 'User Already Exists'
        }
        await postgres.insertUser(uid, password, role);
        return 'User Registered';
    } else {
        return 'Enter All Required Params'
    }
};

const loginUser = async (body) => {
    const {uid, password} = body;
    const token = 'Bearer ' + uuidv4();
    const date = new Date();
    const expiry = date.setMinutes(date.getMinutes() + 10);
    if (uid && password) {
        const userResult = await postgres.getUser(uid, password);
        if (userResult.rows.length === 0) {
            return 'No User Found';
        }
        const user = userResult.rows[0]
        await postgres.insertTokenTable(token, user.uid, expiry);
        let slotTimes = [];
        if (user.role === 'dean') {
            slotTimes = await getDeanSlotsDetails(user.uid);
        } else {
            slotTimes = await getStudentSlotsDetails(user.uid);
        }
        return {token, slotTimes};
    } else {
        return 'Enter All Required Params'
    }
};

const insertSlotInfo = async (body) => {
    const {uidstudent, uiddean, time} = body;
    const slotDays = [];
    slotTimeGenerator(slotDays)
    if (uidstudent && uiddean && time) {
        const existUserDean = await existUser(uiddean)
        if (!existUserDean) {
            return 'Enter proper dean details'
        }

        const deanTime = await getDeanSlots(uiddean);
        if (slotDays.includes(time) && !deanTime.includes(time)) {
            const intTime = Number(time);
            await postgres.insertSlotInfo(uidstudent, uiddean, intTime);
            return 'Success';
        }
        else {
            return 'Enter Available Slot'
        }
        
    } else {
        return 'Enter All Required Params'
    }
};

const getSlotInfo = async (body) => {
    const {uiddean} = body;
    const slotDays = [];
    slotTimeGenerator(slotDays)
    if (uiddean) {
        const existUserDetails = await existUser(uiddean)
        if (!existUserDetails) {
            return 'Enter proper dean details'
        }
        const deanTime = await getDeanSlots(uiddean);
        const bookedSlots = [];
        const availableSlots = [];
        slotDays.forEach((item) => {
            if (deanTime.includes(item)) {
                bookedSlots.push({[item]: new Date(Number(item))})
            } else {
                availableSlots.push({[item]: new Date(Number(item))})
            }
        })
        const data = [
            {bookedSlots}, {availableSlots}
        ]
        return data;
    } else {
        return 'Enter All Required Params'
    }
};

exports.registerUser = registerUser;
exports.loginUser = loginUser;
exports.insertSlotInfo = insertSlotInfo;
exports.getSlotInfo = getSlotInfo;
