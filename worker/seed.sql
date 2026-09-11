-- Public CV-derived seed only. Does not overwrite existing edits.
INSERT OR IGNORE INTO entries (id,kind,title,authors,summary,body,category,status,date,organization,url,visibility,position,updated_at) VALUES ('hermes','project','Hermes','','Agentic optimization for foundation-model training, from FX graphs to Inductor fusion passes.','## Agentic foundation-model training

I am building Hermes, an agentic system that optimizes foundation-model training with torch.compile, as a research assistant working with Yanbo Liang and Tingfeng Ruan at ByteDance Seed.

## Research directions

The work explores agents that automatically write and apply FX graph passes for graph-level optimization, author Inductor IR passes to discover new fusion patterns, and generate joint FX graphs for scheduling large-scale distributed training workloads.

This overview describes the work listed in my CV. Detailed results and implementation updates will be added when ready to share.','AI systems','Ongoing','Mar 2026–Present','ByteDance Seed','','public','0','2026-09-11T00:00:00.000Z');
INSERT OR IGNORE INTO entries (id,kind,title,authors,summary,body,category,status,date,organization,url,visibility,position,updated_at) VALUES ('risc-v','project','Five-stage RISC-V core','','A pipelined RISC-V processor with branch prediction, awarded first prize in the China College IC Competition.','## Processor design

I built a five-stage RISC-V CPU core with branch prediction. This project won first prize in the China College IC Competition.

The project repository contains the implementation.','Hardware design','Course project','','Peking University','https://github.com/worldline22/DeepSleep','public','1','2026-09-11T00:00:00.000Z');
INSERT OR IGNORE INTO entries (id,kind,title,authors,summary,body,category,status,date,organization,url,visibility,position,updated_at) VALUES ('cnn-accelerator','project','CNN accelerator tape-out','','A convolutional neural network accelerator designed for a TSMC 180-nm process.','## From accelerator design to silicon

I am designing a CNN accelerator for tape-out in a TSMC 180-nm process.

The repository linked below contains the project work referenced in my CV.','Hardware design','In development','','Peking University','https://github.com/Gracfusie/CSCD','public','2','2026-09-11T00:00:00.000Z');
INSERT OR IGNORE INTO entries (id,kind,title,authors,summary,body,category,status,date,organization,url,visibility,position,updated_at) VALUES ('spmm','project','Sparse matrix acceleration','','A hardware accelerator for sparse matrix–dense matrix multiplication using a high-level chip-design language.','## Sparse computation

I developed a hardware accelerator for sparse matrix–dense matrix multiplication (SpMM) using a high-level chip-design language.

The project repository contains the implementation.','Hardware design','Course project','','Peking University','https://github.com/worldline22/My_SpMM','public','3','2026-09-11T00:00:00.000Z');
INSERT OR IGNORE INTO entries (id,kind,title,authors,summary,body,category,status,date,organization,url,visibility,position,updated_at) VALUES ('fpga-placement','project','FPGA detailed placement','','An electronic design automation tool for detailed placement and wirelength optimization.','## Optimizing physical design

I developed an EDA tool for FPGA detailed placement and wirelength optimization.

The project repository contains the implementation.','Hardware design','Course project','','Peking University','https://github.com/worldline22/FPGA_r_op','public','4','2026-09-11T00:00:00.000Z');
INSERT OR IGNORE INTO entries (id,kind,title,authors,summary,body,category,status,date,organization,url,visibility,position,updated_at) VALUES ('estrom','paper','ESTroM','Anjunyi Fan, Xuejie Liu, Anji Liu, Qiuping Wu, Jiaqi Yang, Yuchao Qin, Guy Van den Broeck, Yitao Liang, and Bonan Yan','Element-flow architecture for processing sparse tractable probabilistic models.','## Publication

Anjunyi Fan, Xuejie Liu, Anji Liu, Qiuping Wu, Jiaqi Yang, Yuchao Qin, Guy Van den Broeck, Yitao Liang, and Bonan Yan. ESTroM: element-flow architecture for processing sparse tractable probabilistic models. Proceedings of the 32nd International Symposium on High-Performance Computer Architecture (HPCA), 2026.

This publication is listed in my CV.','Computer architecture','HPCA · 2026','2026','Peking University','','public','0','2026-09-11T00:00:00.000Z');
INSERT OR IGNORE INTO entries (id,kind,title,authors,summary,body,category,status,date,organization,url,visibility,position,updated_at) VALUES ('ras','paper','RAS','Yuchao Qin, Anjunyi Fan, and Bonan Yan','A bit-exact rANS accelerator for high-performance neural lossless compression.','## Lossless compression, from algorithm to architecture

Working with Prof. Bonan Yan at Peking University, I designed an end-to-end workflow for a lossless-compression accelerator based on probabilistic circuits.

I developed a bit-exact Python implementation of the rANS compression algorithm and proposed a parallel accelerator architecture to improve computational efficiency.

## Publication

Yuchao Qin, Anjunyi Fan, and Bonan Yan. RAS: a bit-exact rANS accelerator for high-performance neural lossless compression. arXiv:2511.04684, 2025.','Computer architecture','Preprint · 2025','Sep 2024–Jun 2026','Peking University','https://arxiv.org/abs/2511.04684','public','1','2026-09-11T00:00:00.000Z');
INSERT OR IGNORE INTO entries (id,kind,title,authors,summary,body,category,status,date,organization,url,visibility,position,updated_at) VALUES ('chronomem','paper','ChronoMem','Yuchao Qin, Peijing Li, and Thierry Tambe','Memory-aware profiling and data placement for retention-constrained on-chip memories in ASIPs.','## Understanding data lifetime

As part of the Stanford UGVR Program, I worked with Prof. Thierry Tambe on memory-aware profiling and optimization for application-specific instruction-set processors.

I extended an ASIP design tool with profiling and logging capabilities, collected memory-access traces across designs and workloads, and analyzed architectural trade-offs.

I also implemented multicore simulation and developed a profiling-driven optimizer for memory-aware algorithms and compilation.

## Presentation

Yuchao Qin, Peijing Li, and Thierry Tambe. ChronoMem: evaluating data lifetime and optimizing data placement for retention constrained on-chip memories in ASIPs. Synopsys ASIP University Day, November 2025.','Computer architecture','Presented · 2025','Jun 2025–Jan 2026','Stanford University','https://www.synopsys.com/content/dam/synopsys/events/documents/asipunivday2025-yuchao-qin.pdf','public','2','2026-09-11T00:00:00.000Z');
