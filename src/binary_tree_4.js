/* The Computer Language Benchmarks Game
   https://salsa.debian.org/benchmarksgame-team/benchmarksgame/

   contributed by Léo Sarrazin
   multi thread by Andrey Filatkin
*/

function masterThread() {
    const maxDepth = 21

    const stretchDepth = maxDepth + 1;
    const check = itemCheck(bottomUpTree(stretchDepth));
    console.log(`stretch tree of depth ${stretchDepth}\t check: ${check}`);

    const longLivedTree = bottomUpTree(maxDepth);

    const tasks = [];
    let index = 0;
    for (let depth = 4; depth <= maxDepth; depth += 2) {
        const iterations = 1 << maxDepth - depth + 4;
        tasks.push([index, iterations, depth]);
        index++;
    }

    const results = [];
    threadReduce(tasks, null, (index, result) => {
        results[index] = result;
    }, err => {
        for (let i = 0; i < results.length; i++) {
            console.log(results[i]);
        }

        console.log(`long lived tree of depth ${maxDepth}\t check: ${itemCheck(longLivedTree)}`);
    });
}

function threadReduce(tasks, workerData, reducer, cb) {
    let ind = 0;
    function schedule(worker){
        if (ind < tasks.length) {
            worker.work(...(tasks[ind++]), (err, id, result) => {
                reducer(id, result)
                schedule(worker)
            });
        } else {
            worker.exit(() => {
				WorkerMaster.unrequire(worker)
                if (!WorkerMaster.count()) {
                    cb();
                }
            });
        }
    }

    WorkerMaster.register({
        ready(){
            schedule(this)
        }
    })

    const size = 2;

    for (let i = 0; i < size; i++) {
        WorkerMaster.require('./worker.js', workerData);
    }
}

masterThread(); 
